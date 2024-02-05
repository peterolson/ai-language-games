export function sampleArray<T>(arr: T[], n: number): T[] {
	if (arr.length <= n) return arr;
	let result = [];
	const indices = Array.from({ length: arr.length }, (_, i) => i);
	for (let i = 0; i < n; i++) {
		const index = Math.floor(Math.random() * indices.length);
		result.push(arr[indices[index]]);
		indices.splice(index, 1);
	}
	return result;
}
