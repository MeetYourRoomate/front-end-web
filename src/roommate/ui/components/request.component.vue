<template>
  <div class="request">
    <p class="request__status" :style="{ color: statusColors[status] }">{{ status }}</p>
    <div v-if="actions">
      <p class="request__name">{{ requestor.name }} {{ requestor.surname }}</p>

      <div class="request__actions">
        <Button text="Decline" color="secondary" :loader="declining" @click="declineRequest" />
        <Button text="Accept" :loader="accepting" @click="acceptRequest" />
      </div>
    </div>
    <div v-else>
      <p class="request__name">{{ requested.name }} {{ requested.surname }}</p>
    </div>
  </div>

  <div class="modal" v-if="handleTeamEnrollment">
    <div class="modal__content">
      <p>Congratulation! You've enroll a team!</p>
    </div>
  </div>

  <Toast />

</template>

<style lang="scss">

.request {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border: 1px solid black;
  border-radius: 1rem;

  .request__status {
    font-weight: $bold;
  }

  .request__name {
    text-align: center;
  }
}
</style>

<script setup>
import { onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
// Services
import RequestsService from '@/roommate/services/request-api.service.js'
// Component
import Button from '@/shared/ui/components/button.component.vue'

const router = useRouter()
const requestor = ref({})
const requested = ref({})
const status = ref('')
const toast = useToast()
const handleTeamEnrollment = ref(false)
const accepting = ref(false)
const declining = ref(false)

const statusColors = {
  PENDING: '#c2a200',
  ACCEPTED: 'green',
  DECLINED: 'red'
}

const isPending = ref(false)

const props = defineProps({
  request: {
    type: Object,
    required: true
  },
  actions: {
    type: Boolean,
    required: true
  }
})

const teamEnrollAnimation = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  user.teamStatus = 'ONTEAM'
  localStorage.setItem('user', JSON.stringify(user))

  handleTeamEnrollment.value = true
  setTimeout(() => {
    router.push({ name: 'my-team-view', params: { id: user.id } })
    handleTeamEnrollment.value = false
  }, 2000)
}

const acceptRequest = () => {
  if (!isPending.value) {
    return
  }

  if (declining.value) return

  accepting.value = true
  const requestsService = new RequestsService()
  requestsService.accept(props.request.id)
    .then((response) => {
      status.value = response.status
      toast.add({ severity: 'success', summary: 'Request accepted correctly', life: 3000 })
      teamEnrollAnimation()
    })
    .catch((error) => {
      toast.add({ severity: 'error', summary: 'Error when accepting request', detail: error.message, life: 3000 })
    })
    .finally(() => {
      accepting.value = false
    })
}

const declineRequest = () => {
  if (!isPending.value) {
    return
  }
  if (accepting.value) return

  declining.value = true
  const requestsService = new RequestsService()
  requestsService.decline(props.request.id)
    .then((response) => {
      status.value = response.status
      toast.add({ severity: 'success', summary: 'Request declineds correctly', life: 3000 })
    })
    .catch((error) => {
      toast.add({ severity: 'error', summary: 'Error when accepting request', detail: error.message, life: 3000 })
    })
    .finally(() => {
      declining.value = false
    })
}

onMounted(() => {
  console.log(props.request)
  requestor.value = props.request.studentRequestor
  requested.value = props.request.studentRequested
  status.value = props.request.status

  isPending.value = status.value === 'PENDING'
})

</script>
