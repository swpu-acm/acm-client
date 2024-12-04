<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const id = route.params.id as string;

const path = [{ label: 'New problem' }];
</script>

<template>
    <div class="flex-1 flex flex-col">
        <UniversalToolBar :path></UniversalToolBar>
        <ProblemEditor :id></ProblemEditor>
        <UniversalFooter></UniversalFooter>
    </div>
</template>
