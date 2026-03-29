<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let onClose = () => {dispatch("goToHome");};
export let onPayment = () => {dispatch("goToPayment");};

  const features = [
    {
      name: 'Create Your Signature',
      icon: 'pen',
      premium: true,
      basic: true,
    },
    {
      name: 'Signature Fonts',
      icon: 'text',
      premium: true,
      basic: false,
    },
    {
      name: 'Unlock All Features',
      icon: 'lock',
      premium: true,
      basic: false,
    },
    {
      name: 'VIP Customer Support',
      icon: 'headphones',
      premium: true,
      basic: false,
    },
    {
      name: 'Remove Ads',
      icon: 'muted',
      premium: true,
      basic: false,
    },
  ];

  function getIcon(name) {
    const iconMap = {
      pen: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17.25V21h3.75L17.81 9.94m-6.75-6.75l2.5-2.5a2.828 2.828 0 014 4l-2.5 2.5m-2-2l6 6"/></svg>`,
      text: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
      lock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`,
      headphones: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0118 0v6M9 21h6v-2a3 3 0 00-3-3 3 3 0 00-3 3v2z"/></svg>`,
      muted: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 5H8c-1.1 0-2 .9-2 2v8m6 0h5c1.1 0 2-.9 2-2v-8m-3 14h6m-9 0H6m4-14v-1a1 1 0 112 0v1"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`,
    };
    return iconMap[name] || '';
  }
</script>

<div class="fixed inset-0 flex items-center justify-center p-4 z-50" style="background: #16171724;">
  <div class=" border border-blue-500/20 rounded-3xl max-w-2xl w-full relative" style="background: white;">
    <!-- Close Button -->
    <button
      on:click={onClose}
      class="absolute top-6 left-6 text-black text-3xl font-light hover:opacity-70 transition"
      aria-label="Close"
    >
      ✕
    </button>

    <!-- Content -->
    <div class="p-8 pt-16">
      <!-- Star Icon -->
      <div class="flex justify-center mb-6">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#38a53d"
          stroke-width="1.5"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>

      <!-- Heading -->
      <h1 class="text-4xl font-bold text-black text-center mb-3">
        START LIKE A PRO
      </h1>
      <p class="text-xl text-center mb-8 text-gray">
        Unlock All Features
      </p>

      <!-- Comparison Table -->
      <div class="mb-8">
        <!-- Header -->
        <div class="grid grid-cols-3 gap-4 mb-6 px-4">
          <div></div>
          <div class="text-right">
            <p class="text-black font-semibold">PREMIUM</p>
          </div>
          <div class="text-right">
            <p class="text-black font-semibold">BASIC</p>
          </div>
        </div>

        <!-- Features -->
        <div class="space-y-4">
          {#each features as feature}
            <div class="grid grid-cols-3 gap-4 items-center px-4 py-3 rounded-lg hover:bg-blue-500/5 transition">
              <!-- Feature Name -->
              <div class="flex items-center gap-3">
                <div class="color-green flex-shrink-0">
                  {@html getIcon(feature.icon)}
                </div>
                <span class="text-black font-medium">{feature.name}</span>
              </div>

              <!-- Premium Check -->
              <div class="text-right">
                {#if feature.premium}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#38a53d"
                    stroke-width="3"
                    class="ml-auto"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                {/if}
              </div>

              <!-- Basic Check/Dash -->
              <div class="text-right">
                {#if feature.basic}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#38a53d"
                    stroke-width="3"
                    class="ml-auto"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                {:else}
                  <div class="w-5 h-1 bg-green rounded ml-auto"></div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Pricing Text -->
      <p class="text-center text-black mb-6">
        <span class="text-lg">14,99 €/week</span>
        <span class="text-gray"> after FREE 7-day trial</span>
      </p>

      <!-- CTA Button -->
      <button
      on:click={onPayment}
        class="w-full bg-green text-white font-bold py-4 px-6 rounded-full text-lg transition mb-6" 
      >
        START FREE TRIAL
      </button>

      <!-- Footer Text -->
      <p class="text-center text-xs text-gray mb-4">
        By continuing you agree to our <a href="#" class="text-black underline">Terms</a> and <a href="#" class="text-black underline">Privacy</a> policies
      </p>
      <p class="text-center text-xs text-gray leading-relaxed">
        Subscription is billed after the trial ends and will auto-renew. You can cancel your subscription anytime before your trial ends to avoid charges.
      </p>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
  .bg-green{
    background: #38a53d;
  }
  .color-green{
    color: #38a53d
  }
  .text-gray{
    color: #616263;
  }
</style>
