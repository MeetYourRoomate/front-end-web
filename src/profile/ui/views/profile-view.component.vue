<template>
  <div class="container">
    <div class="profile">
      <div class="profile__title">
        <h1>This is my profile</h1>
      </div>
      <div class="profile__image">
        <img src="@/roommate/ui/assets/avatar.png" alt="">
      </div>
      <div class="profile__information">
        <p><span class="fw-bold">Name: </span> {{ profile.name }}</p>
        <p><span class="fw-bold">Surname: </span> {{ profile.surname }}</p>
        <p><span class="fw-bold">Phone: </span>+{{ profile.phone.code }} {{ profile.phone.number }}</p>
      </div>

      <div class="divider"></div>
      <div v-if="isStudent">
        <div v-if="!self">
          <RequestComponent :request="request" />
        </div>

        <div v-else>
          <RoommateRequestComponent />
        </div>
      </div>
      <div class="divider"></div>
      <div v-if="isStudent">
        <div class="change__role">
          <h2>Do you want to be a lessor?</h2>
          <button @click="handleChangingRole = !handleChangingRole"  class="button-primary">Change to Lessor</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal" v-if="handleChangingRole">
    <div class="modal__content">
      <h1>Are you sure you want to change to lessor?</h1>
      <p>You can not go back to student</p>
      <div class="modal__actions">
        <button @click="handleChangingRole = !handleChangingRole" class="button-black">Cancel</button>
        <button @click="changeRole" class="button-primary">Change to Lessor</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.profile {
  text-align: center;

  .profile__image {
    width: 100%;
    overflow: hidden;

    img {
      border-radius: 1rem;
      max-height: 35rem;
      object-fit: cover;
    }
  }

  .profile__information {
    font-size: 2.2rem;
  }

  .divider {
    margin: 3rem auto;
    background-color: rgba($color: #000000, $alpha: 1.0);
  }

  .change__role {
    margin-bottom: 2rem;
  }
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba($color: #000000, $alpha: 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  .modal__content {
    background-color: $white;
    padding: 2rem;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    h1 {
      text-align: center;
    }

    .modal__actions {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2rem;

      button {
        margin-right: 1rem;
      }
    }
  }
}
</style>

<script setup>
import { onMounted, ref, computed } from 'vue'
import ProfilesService from '@/profile/services/profiles-api.service.js'
import Profile from '@/profile/domain/profile.entity.js'
import Request from '@/roommate/domain/request.entity.js'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import RequestComponent from '@/roommate/ui/components/request-form-component.vue'
import RoommateRequestComponent from '@/roommate/ui/components/roommate-requests-component.vue'
import { userStore } from '@/shared/config/store'

const profile = ref(new Profile({}))
const route = useRoute()
const request = ref(new Request({}))
const currentUser = userStore()
const router = useRouter()
const handleChangingRole = ref(false)

const self = computed(() => {
  return route.params.id ? route.params.id === '' : true
})

const isStudent = computed(() => {
  return currentUser.state.user.role === 'ROLE_USER_STUDENT'
})

const changeRole = () => {
  currentUser.changeRole(currentUser.state.user.id)
    .then(() => {
      handleChangingRole.value = false
      router.push({ name: 'my-offers-view', params: { id: currentUser.state.user.id } })
    })
}

onMounted(() => {
  const profilesService = new ProfilesService()
  if (!self.value) {
    request.value.requestorId = currentUser.state.user.id
    request.value.requestedId = route.params.id

    profilesService.getById(route.params.id)
      .then((response) => {
        profile.value = response.data.resource
      })
      .catch((error) => {
        console.log(error)
      })
  } else {
    const userId = currentUser.state.user.id

    profilesService.getByUserId(userId).then((response) => {
      profile.value = response.data.resource
    })
  }
})

onBeforeRouteUpdate((to, from) => {
  if (to.params.id !== from.params.id) {
    const userId = currentUser.state.user.id
    const profilesService = new ProfilesService()
    profilesService.getByUserId(userId).then((response) => {
      profile.value = response.data.resource
    })
  }
})

</script>