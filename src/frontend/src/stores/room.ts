import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Room } from '../types'

export const useRoomStore = defineStore('room', () => {
  const rooms = ref<Room[]>([])
  const currentRoom = ref<Room | null>(null)
  
  const onlineRooms = computed(() => 
    rooms.value.filter(r => r.status === 'waiting')
  )

  return {
    rooms,
    currentRoom,
    onlineRooms
  }
})
