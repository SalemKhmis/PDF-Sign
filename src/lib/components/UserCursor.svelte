<!-- lib/components/UserCursor.svelte -->
<script>
    export let x = 0;
    export let y = 0;
    export let color = '#3ba83a';
    export let name = '';
</script>

<div class="remote-cursor" style="left: {x}px; top: {y}px;">
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M2 2 L20 11 L11 13 L8 20 Z"
            fill={color}
            stroke="white"
            stroke-width="1.5"
            stroke-linejoin="round"
        />
    </svg>
    {#if name}
        <div class="label" style="background: {color};">{name}</div>
    {/if}
</div>

<style>
    .remote-cursor {
        position: absolute;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-2px, -2px);
        transition: left 120ms linear, top 120ms linear;
    }
    .label {
        position: absolute;
        left: 18px;
        top: 14px;
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
</style>
