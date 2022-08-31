import App from './App.svelte';

class TestClass {
	fieldOne = 42;
	fieldTwo;
	constructor(fieldTwo) {
		fieldTwo = fieldTwo;
	}
}

const app = new App({
	target: document.body,
	props: {
	}
});

export default app;