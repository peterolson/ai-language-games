<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { t, locale, locales } from '$lib/translations';
</script>

<header>
	<a href="/">{$t('general.title')}</a>
	<select bind:value={$locale}>
		{#each $locales as l}
			<option value={l}>{$t('lang.' + l)}</option>
		{/each}
	</select>
	<SvelteToast />
</header>
<main>
	<slot />
</main>

<style>
	header {
		background-color: #f0f0f0;
		display: flex;
		align-items: center;
	}
	header a {
		padding: 8px;
	}

	main {
		overflow: auto;
	}
</style>
