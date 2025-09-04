export interface UserAvatar {
  address: string
  avatar?: string
  username?: string
}

export const fetchUserAvatar = async (address: string): Promise<UserAvatar | null> => {
  try {
    const response = await fetch(`/api/profile?address=${address}`)
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    if (data && data.profile) {
      return {
        address: data.profile.address,
        avatar: data.profile.avatar,
        username: data.profile.username
      }
    }
    
    return null
  } catch (error) {
    console.error("Error fetching user avatar:", error)
    return null
  }
}

export const fetchMultipleUserAvatars = async (addresses: string[]): Promise<Map<string, UserAvatar>> => {
  const avatarMap = new Map<string, UserAvatar>()
  
  // Fetch avatars in parallel
  const promises = addresses.map(async (address) => {
    const avatar = await fetchUserAvatar(address)
    if (avatar) {
      avatarMap.set(address.toLowerCase(), avatar)
    }
  })
  
  await Promise.all(promises)
  return avatarMap
} 