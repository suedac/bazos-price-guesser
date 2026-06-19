import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Test files share Crawlee's on-disk default storage (./storage), so they
        // must not run concurrently or one file's dataset leaks into another's.
        fileParallelism: false,
    },
});
