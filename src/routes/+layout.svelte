<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { t, locale, locales } from '$lib/translations';
	import { selectedVoices, voices } from '$lib/translations/voices';

	const handleLocaleChange = (event: Event) => {
		const { value } = event.target as HTMLSelectElement;
		document.cookie = `lang=${value};`;
	};
</script>

<header>
	<a href="/">{$t('general.title')}</a>
	<select bind:value={$locale} on:change={handleLocaleChange}>
		{#each $locales as l}
			<option value={l}>{$t('lang.' + l)}</option>
		{/each}
	</select>
	<select bind:value={$selectedVoices[$locale]}>
		{#each voices[$locale] as voice}
			<option value={voice.id}>{voice.name}</option>
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
