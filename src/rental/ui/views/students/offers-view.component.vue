<template>
  <div class="offers container">
    <h1>Look for your place</h1>
    <div class="divider"></div>
    <LoadingComponent v-if="loading"></LoadingComponent>
    <div v-else class="offers__list">
      <OfferPreviewComponent v-for="offer in offers" :key="offer.id" :offer="offer" />
    </div>
  </div>
</template>

<style lang="scss">
.offers {
  padding: 2rem 0;

  .offers__list {
    padding: 2rem 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(25rem, 1fr));
    gap: 3rem;
  }

  h1 {
    text-transform: uppercase;
  }

  .divider {
    margin: 0;
    background-color: rgba($color: #000000, $alpha: 0.2);
  }

}
</style>

<script setup>
import { onMounted, ref } from 'vue'
// Services
import OffersService from '@/rental/services/offers-api.service'
// Components
import OfferPreviewComponent from '@/rental/ui/components/offer-preview.component.vue'
import LoadingComponent from '@/shared/ui/components/loaders/list-loading.component.vue'

const offers = ref([])
const loading = ref(true)

onMounted(() => {
  const offersService = new OffersService()

  offersService.getVisibles().then((response) => {
    offers.value = response
    loading.value = false
  })
})
</script>
