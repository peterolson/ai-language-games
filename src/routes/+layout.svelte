<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
</script>

<header>
	<a href="/">Language games</a>
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
