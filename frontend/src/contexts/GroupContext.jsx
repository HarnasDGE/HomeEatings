import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

const GroupContext = createContext({})

export const useGroups = () => {
  const context = useContext(GroupContext)
  if (!context) {
    throw new Error('useGroups must be used within a GroupProvider')
  }
  return context
}

export const GroupProvider = ({ children }) => {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [currentGroup, setCurrentGroup] = useState(null)
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadGroups()
      loadInvitations()
    }
  }, [user])

  const loadGroups = async () => {
    if (!supabase || !user) return

    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(role)
        `)
        .eq('group_members.user_id', user.id)
        .order('name')

      if (error) throw error
      setGroups(data || [])

      // Set first group as current if none selected
      if (data && data.length > 0 && !currentGroup) {
        setCurrentGroup(data[0])
      }
    } catch (error) {
      console.error('Error loading groups:', error)
    }
  }

  const loadInvitations = async () => {
    if (!supabase || !user) return

    try {
      const { data, error } = await supabase
        .from('group_invitations')
        .select(`
          *,
          groups(name),
          inviter:profiles!group_invitations_inviter_id_fkey(full_name, avatar_url)
        `)
        .eq('status', 'pending')
        .or(`invitee_id.eq.${user.id},invitee_email.eq.${user.email}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvitations(data || [])
    } catch (error) {
      console.error('Error loading invitations:', error)
    }
  }

  const createGroup = async (name, description) => {
    if (!supabase || !user) return { error: new Error('Not authenticated') }

    setLoading(true)
    try {
      // Create group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert([{ name, description, owner_id: user.id }])
        .select()
        .single()

      if (groupError) throw groupError

      // Add creator as owner member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{ group_id: group.id, user_id: user.id, role: 'owner' }])

      if (memberError) throw memberError

      await loadGroups()
      return { data: group, error: null }
    } catch (error) {
      console.error('Error creating group:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const sendInvitation = async (groupId, inviteeEmail, message) => {
    if (!supabase || !user) return { error: new Error('Not authenticated') }

    setLoading(true)
    try {
      // Check if user exists
      const { data: inviteeData } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', (await supabase.rpc('get_user_by_email', { email: inviteeEmail })))
        .single()

      const { data, error } = await supabase
        .from('group_invitations')
        .insert([{
          group_id: groupId,
          inviter_id: user.id,
          invitee_email: inviteeEmail,
          invitee_id: inviteeData?.id || null,
          message
        }])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error sending invitation:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const acceptInvitation = async (invitationId) => {
    if (!supabase) return { error: new Error('Supabase not configured') }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .rpc('accept_group_invitation', { invitation_id: invitationId })

      if (error) throw error

      await loadGroups()
      await loadInvitations()
      return { data, error: null }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const rejectInvitation = async (invitationId) => {
    if (!supabase) return { error: new Error('Supabase not configured') }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .rpc('reject_group_invitation', { invitation_id: invitationId })

      if (error) throw error

      await loadInvitations()
      return { data, error: null }
    } catch (error) {
      console.error('Error rejecting invitation:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const leaveGroup = async (groupId) => {
    if (!supabase || !user) return { error: new Error('Not authenticated') }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id)

      if (error) throw error

      await loadGroups()
      if (currentGroup?.id === groupId) {
        setCurrentGroup(null)
      }
      return { error: null }
    } catch (error) {
      console.error('Error leaving group:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    groups,
    currentGroup,
    setCurrentGroup,
    invitations,
    loading,
    createGroup,
    sendInvitation,
    acceptInvitation,
    rejectInvitation,
    leaveGroup,
    refreshGroups: loadGroups,
    refreshInvitations: loadInvitations,
  }

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
}
