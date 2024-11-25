<script setup lang="ts">
import { useRoute } from 'vue-router';


const route = useRoute();
const id = route.params.id as string;

</script>

<template>
    {{ id }}
</template>