
<template>
  <div class="container">
    <h1>Create new Offer</h1>
    <form @submit="onSubmit">
      <PropertyForm ref="propertyFormRef" />

      <fieldset>
        <legend>Price</legend>
        <div class="input-group">
          <InputText class="input" type="number" v-model="offer.amount.price" required />
          <label>Price</label>
        </div>
        <div class="input-group">
          <InputText class="input" type="text" v-model="offer.amount.currency" required />
          <label>Currency</label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Offer information</legend>
        <div class="input-group">
          <InputText class="input" type="text" v-model="offer.conditions" required />
          <label>Property Conditions</label>
        </div>
        <div class="input-group">
          <InputText class="input" type="date" v-model="offer.lifecycle.endAt" required />
          <label>End Offer Date</label>
        </div>
      </fieldset>

      <div class="form__actions">
        <Button text="submit" :loader="submiting" @click="onSubmit" />
        <Button text="back" color="secondary" :to="{ name: 'my-offers-view', params: { id: route.params.id } }" />
      </div>
    </form>
  </div>
</template>

<style lang="scss">
@import "@/shared/ui/assets/scss/_inputs.scss";

h1 {
  text-transform: uppercase;
}

fieldset {
  margin: 1rem 0;
  padding: 1.5rem 1rem;
  border-color: rgba($color: #000000, $alpha: 0.2);
  border-width: .1rem;

  legend {
    margin-bottom: 1rem;
    font-weight: $bold;
    text-transform: uppercase;
  }

  .input-group {
    @include input-group;
  }
}

form {
  margin-bottom: 2rem;
  .form__actions {
    display: flex;
    gap: 2rem;
  }
}
</style>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// Services
import OffersService from '@/rental/services/offers-api.service'
// Components
import PropertyForm from '@/rental/ui/components/lessor/property-form.component.vue'
import Button from '@/shared/ui/components/button.component.vue'
// Entitites
import Offer from '@/rental/domain/entity/offer.entity'

const route = useRoute()
const router = useRouter()
const propertyFormRef = ref(null)
const submiting = ref(false)

const offer = ref(new Offer({
  lifecycle: {
    endAt: new Date().toISOString().split('T')[0]
  },
  amount: {
    price: 0
  }
}))

const validateOffer = () => {
  return true
}

const onSubmit = (e) => {
  e.preventDefault()
  if (!propertyFormRef.value.validate()) {
    return
  }

  if (!validateOffer()) {
    return
  }

  submiting.value = true
  const data = {
    rentalOfferingResource: {
      ...offer.value
    },
    propertyResource: propertyFormRef.value.property
  }

  const imageInputRef = propertyFormRef.value.imageInputRef
  if (!imageInputRef.imageBlob.files[0]) return

  const offersService = new OffersService()
  offersService.create(data, route.params.id)
    .then((response) => {
      const propertyId = response.property.id

      imageInputRef.uploadImage({ id: propertyId })
        .then((response) => {
          if (response) {
            submiting.value = false
            setTimeout(() => {
              router.push({ name: 'my-offers-view', params: { id: route.params.id } })
            }, 3000)
          }
        })
        .catch(() => {
          submiting.value = false
        })
    })
    .catch(() => {
      submiting.value = false
    })
}

</script>
