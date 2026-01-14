# 👥 Groups and Invitations System - Database Schema

## SQL Migrations for Group Functionality

Execute these SQL commands in **Supabase Dashboard > SQL Editor**.

### 1. Groups Table

```sql
-- Create groups table
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Policies for groups
CREATE POLICY "Users can view groups they are members of"
  ON groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Group owners can update their groups"
  ON groups FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Group owners can delete their groups"
  ON groups FOR DELETE
  USING (auth.uid() = owner_id);

-- Indexes
CREATE INDEX groups_owner_id_idx ON groups(owner_id);
```

### 2. Group Members Table

```sql
-- Create group_members table
CREATE TABLE group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Policies for group_members
CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group owners can add members"
  ON group_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Group owners can remove members"
  ON group_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.owner_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX group_members_group_id_idx ON group_members(group_id);
CREATE INDEX group_members_user_id_idx ON group_members(user_id);
```

### 3. Group Invitations Table

```sql
-- Create group_invitations table
CREATE TABLE group_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invitee_email TEXT NOT NULL,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

-- Policies for group_invitations
CREATE POLICY "Users can view invitations they sent"
  ON group_invitations FOR SELECT
  USING (auth.uid() = inviter_id);

CREATE POLICY "Users can view invitations sent to them"
  ON group_invitations FOR SELECT
  USING (
    auth.uid() = invitee_id OR
    auth.email() = invitee_email
  );

CREATE POLICY "Group members can send invitations"
  ON group_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_invitations.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Invitees can update their invitation status"
  ON group_invitations FOR UPDATE
  USING (
    auth.uid() = invitee_id OR
    auth.email() = invitee_email
  );

-- Indexes
CREATE INDEX group_invitations_group_id_idx ON group_invitations(group_id);
CREATE INDEX group_invitations_invitee_email_idx ON group_invitations(invitee_email);
CREATE INDEX group_invitations_invitee_id_idx ON group_invitations(invitee_id);
CREATE INDEX group_invitations_status_idx ON group_invitations(status);
```

### 4. Function to Auto-link Invitations to User IDs

```sql
-- Function to automatically link invitations when user signs up
CREATE OR REPLACE FUNCTION link_invitations_to_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Update invitations sent to this email with the user_id
  UPDATE group_invitations
  SET invitee_id = NEW.id
  WHERE invitee_email = NEW.email
  AND invitee_id IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when user is created
CREATE TRIGGER on_user_created_link_invitations
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION link_invitations_to_user();
```

### 5. Function to Auto-accept Invitation and Add to Group

```sql
-- Function to handle invitation acceptance
CREATE OR REPLACE FUNCTION accept_group_invitation(invitation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_group_id UUID;
  v_invitee_id UUID;
BEGIN
  -- Get invitation details
  SELECT group_id, invitee_id
  INTO v_group_id, v_invitee_id
  FROM group_invitations
  WHERE id = invitation_id
  AND (invitee_id = auth.uid() OR invitee_email = auth.email())
  AND status = 'pending';

  -- Check if invitation exists and is valid
  IF v_group_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Update invitation status
  UPDATE group_invitations
  SET status = 'accepted',
      responded_at = NOW(),
      invitee_id = auth.uid()
  WHERE id = invitation_id;

  -- Add user to group (if not already a member)
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (v_group_id, auth.uid(), 'member')
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 6. Function to Reject Invitation

```sql
-- Function to handle invitation rejection
CREATE OR REPLACE FUNCTION reject_group_invitation(invitation_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE group_invitations
  SET status = 'rejected',
      responded_at = NOW(),
      invitee_id = auth.uid()
  WHERE id = invitation_id
  AND (invitee_id = auth.uid() OR invitee_email = auth.email())
  AND status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 7. Modified RLS Policies for Products (Shared Access)

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

-- New policies with group access
CREATE POLICY "Users can view their own and group products"
  ON products FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid()
      AND gm2.user_id = products.user_id
    )
  );

CREATE POLICY "Users can insert their own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);
```

### 8. Modified RLS Policies for Meals (Shared Access)

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own meals" ON meals;
DROP POLICY IF EXISTS "Users can insert their own meals" ON meals;
DROP POLICY IF EXISTS "Users can update their own meals" ON meals;
DROP POLICY IF EXISTS "Users can delete their own meals" ON meals;

-- New policies with group access
CREATE POLICY "Users can view their own and group meals"
  ON meals FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid()
      AND gm2.user_id = meals.user_id
    )
  );

CREATE POLICY "Users can insert their own meals"
  ON meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals"
  ON meals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals"
  ON meals FOR DELETE
  USING (auth.uid() = user_id);
```

### 9. Triggers for Updated_at

```sql
-- Trigger for groups
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 10. Helpful Views

```sql
-- View for user's groups with member count
CREATE OR REPLACE VIEW user_groups AS
SELECT
  g.id,
  g.name,
  g.description,
  g.owner_id,
  g.created_at,
  g.updated_at,
  gm.role as user_role,
  COUNT(DISTINCT gm2.user_id) as member_count,
  json_agg(
    json_build_object(
      'user_id', p.id,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url,
      'role', gm2.role
    )
  ) as members
FROM groups g
JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = auth.uid()
LEFT JOIN group_members gm2 ON g.id = gm2.group_id
LEFT JOIN profiles p ON gm2.user_id = p.id
GROUP BY g.id, g.name, g.description, g.owner_id, g.created_at, g.updated_at, gm.role;
```

## Verification Queries

After running migrations:

```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('groups', 'group_members', 'group_invitations');

-- Check if functions exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('accept_group_invitation', 'reject_group_invitation');
```

## Summary

**New Tables:**
- `groups` - Group information
- `group_members` - Many-to-many relationship between users and groups
- `group_invitations` - Pending, accepted, and rejected invitations

**Key Features:**
- Users can be in multiple groups
- Products and meals are visible to all group members
- Only owners can edit/delete their own items
- Email-based invitations (works even if user doesn't have account yet)
- Automatic linking of invitations when user signs up
- Secure functions for accepting/rejecting invitations

**Security:**
- Full RLS protection on all tables
- Users can only see groups they're members of
- Users can only see invitations sent to them
- Products/meals remain private to owner for editing
- Products/meals visible to group members for viewing
