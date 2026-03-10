<template>
  <div class="hero-select">
    <h2 class="title">选择武将</h2>
    
    <div class="faction-tabs">
      <button 
        v-for="f in factions" 
        :key="f"
        :class="['tab', { active: selectedFaction === f }]"
        @click="selectedFaction = f"
      >
        {{ f }}
      </button>
    </div>

    <div class="hero-grid">
      <div 
        v-for="hero in filteredHeroes" 
        :key="hero.id"
        :class="['hero-card', `rarity-${hero.rarity || 'common'}`]"
        @click="selectHero(hero)"
      >
        <div class="hero-avatar">{{ hero.name.charAt(0) }}</div>
        <div class="hero-info">
          <h3>{{ hero.name }}</h3>
          <p class="skill-name">{{ hero.skill.name }}</p>
          <p class="skill-desc">{{ hero.skill.description }}</p>
        </div>
      </div>
    </div>

    <button 
      class="confirm-btn" 
      :disabled="!selectedHero"
      @click="confirm"
    >
      确认选择
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { heroes } from '../data/gameData'
import type { Hero, Faction } from '../types'

const props = defineProps<{
  playerId: string
}>()

const emit = defineEmits<{
  selected: [hero: Hero]
}>()

const factions: Faction[] = ['魏', '蜀', '吴']
const selectedFaction = ref<Faction>('魏')
const selectedHero = ref<Hero | null>(null)

const filteredHeroes = computed(() => 
  heroes.filter(h => h.faction === selectedFaction.value)
)

const selectHero = (hero: Hero) => {
  selectedHero.value = hero
}

const confirm = () => {
  if (selectedHero.value) {
    emit('selected', selectedHero.value)
  }
}
</script>

<style scoped>
.hero-select {
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: var(--text-primary);
}

.faction-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.tab {
  padding: 10px 20px;
  border-radius: 8px;
  background: var(--void-bg-card);
  border: 1px solid var(--void-border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.tab.active {
  background: var(--neon-green);
  color: var(--void-bg);
  border-color: var(--neon-green);
}

.hero-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.hero-card {
  padding: 15px;
  border-radius: 12px;
  background: var(--void-bg-card);
  border: 2px solid var(--void-border);
  cursor: pointer;
  transition: all 0.3s;
}

.hero-card:hover {
  transform: translateY(-5px);
  border-color: var(--neon-green);
}

.hero-card.rarity-rare {
  border-color: #9b59b6;
}

.hero-card.rarity-legendary {
  border-color: #f39c12;
  box-shadow: 0 0 20px rgba(243, 156, 18, 0.3);
}

.hero-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--neon-green), var(--neon-blue));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: var(--void-bg);
  margin: 0 auto 10px;
}

.hero-info h3 {
  font-size: 18px;
  margin: 0 0 5px;
  text-align: center;
  color: var(--text-primary);
}

.skill-name {
  font-size: 14px;
  color: var(--neon-green);
  text-align: center;
  margin: 5px 0;
}

.skill-desc {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  margin: 0;
}

.confirm-btn {
  width: 100%;
  padding: 15px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--neon-green), var(--neon-blue));
  color: var(--void-bg);
  font-size: 18px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-btn:not(:disabled):hover {
  transform: scale(1.02);
}
</style>
