<template>
  <main class="landing-page">
      <LandingPageOverlay />
      <article class="logo-border">
      <img src="@/assets/BeanLogo.svg" alt="Logo">
      </article>
      <h1>AIR BEAN</h1>
      <p>DRONEDELIVERED COFFEE</p>

  </main>
</template>

<script>

import LandingPageOverlay from '@/components/LandingPageFlowers'

// BeanLogo  '@/assets/BeanLogo.svg'
export default {
    name: 'landing-page',
    components: {
        LandingPageOverlay
    }
}
</script>

<style>


</style>