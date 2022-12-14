<template>
  <div class="container">
    <LoadingComponent v-if="loading"></LoadingComponent>
    <div v-else class="team">
      <h1>My Team</h1>
      <div class="divider"></div>
      <p v-if="!haveTeam">Look for a roommate to enroll a team!</p>
      <div v-else>
        <section class="section">
          <h2>Team Members</h2>
          <div class="team__members">
            <RoommateComponent v-for="roommate in roommates" v-bind:key="roommate.id" :roommate="roommate"
              @goToProfile="goToProfile" />
          </div>
        </section>

        <div class="section">
          <h2>Duties</h2>
          <div v-if="haveDuties" class="team__duties">
            <DutyComponent v-for="duty in duties" v-bind:key="duty.id" :duty="duty" @finish="refreshDuty" />
          </div>
          <div v-else>
            <p>There's no duties</p>
            <p>Create a duty to organice your team</p>
          </div>

          <div class="team__buttons">
            <Button text="delete team" color="secondary" @click="deleteTeam" />
            <Button text="Create duty"
              :to="{ name: 'create-duty-view', params: { id: route.params.id, teamId: team.id } }" :inline="true" />
          </div>

        </div>

        <div class="divider"></div>
        <div class="section">
          <h2>Requests</h2>
          <div v-if="haveRequests" class="team__requests">
            <TeamRequestComponent v-for="request in teamRequests" v-bind:key="request.id" :request="request"
              @update="updateRequest" />
          </div>
          <div v-else>
            <p>There's no requests</p>
            <p>Ask for a roommate to join your team</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.team {
  margin: 2rem 0;

  .section {
    margin: 2rem 0;
  }

  .team__members {
    margin: 2rem 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    align-items: center;
    gap: 2rem;
  }

  .team__duties {
    margin: 2rem 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(25rem, 1fr));
    gap: 2rem;
  }

  .team__requests {
    margin-top: 1rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
    gap: 2rem;
  }

  .team__buttons {
    display: flex;
    gap: 1rem;
  }
  .divider {
    width: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    margin: 1rem 0;
  }
}
</style>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userStore } from '@/shared/infraestructure/store'
// Services
import TeamsService from '@/coexistance/services/teams-api.service'
import TeamRequestsService from '@/coexistance/services/team-requests-api.service'
// Components
import RoommateComponent from '@/coexistance/ui/components/roommate.component.vue'
import DutyComponent from '@/coexistance/ui/components/duty.component.vue'
import TeamRequestComponent from '@/coexistance/ui/components/team-request.component.vue'
import Button from '@/shared/ui/components/button.component.vue'
import LoadingComponent from '@/shared/ui/components/loaders/team-detail-loading.component.vue'
// Entities
import Team from '@/coexistance/domain/team.entity'
import Roommate from '@/coexistance/domain/roommate.entity'
import Duty from '@/coexistance/domain/duty.entity'

const route = useRoute()
const router = useRouter()
const currentUser = userStore()
const team = ref(new Team({}))
const roommates = ref([])
const duties = ref([])
const teamRequests = ref([])
const loading = ref(true)
const haveTeam = ref(false)

const goToProfile = (id) => {
  if (id === currentUser.state.user.profileId) {
    router.push({ name: 'show-profile-view' })
  } else {
    router.push({ name: 'show-profile-view', params: { id } })
  }
}

const haveDuties = computed(() => {
  return duties.value.length > 0
})

const haveRequests = computed(() => {
  return teamRequests.value.length > 0
})

const updateRequest = (request) => {
  teamRequests.value = teamRequests.value.map((r) => {
    if (r.id === request.id) {
      return request
    }
    return r
  })

  if (request.status === 'ACCEPTED') {
    getTeam()
  }
}

const refreshDuty = (duty) => {
  duties.value = duties.value.map((d) => {
    if (d.id === duty.id) {
      return duty
    }
    return d
  })
}

const getTeam = () => {
  const teamsService = new TeamsService()
  teamsService.getByUserId(route.params.id)
    .then((response) => {
      team.value = response
      roommates.value = response.roommates.map((roommate) => new Roommate(roommate))
      duties.value = response.duties.map((duty) => new Duty(duty))
    })
}

const deleteTeam = () => {
  const teamsService = new TeamsService()
  teamsService.delete(team.value.id)
    .then(() => {
      const user = localStorage.getItem('user')
      user.teamStatus = 'WITHOUTTEAM'
      localStorage.setItem('user', JSON.stringify(user))
      router.push({ name: 'show-profile-view' })
    })
}

onMounted(() => {
  const teamsService = new TeamsService()

  teamsService.getByUserId(route.params.id)
    .then((response) => {
      // TODO: Order duties by dateline
      team.value = response
      roommates.value = response.roommates.map((roommate) => new Roommate(roommate))
      duties.value = response.duties.map((duty) => new Duty(duty))
      haveTeam.value = true

      const teamRequestsService = new TeamRequestsService()
      teamRequestsService.getAllByTeamId(response.id)
        .then((response) => {
          teamRequests.value = response
          loading.value = false
        })
    })
    .catch(() => {
      loading.value = false
    })
})
</script>
