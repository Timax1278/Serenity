<template>
  <div class="meditation">
    <h1>Meditation Library</h1>
    <p>Explore our collection of guided meditations.</p>
    <button class="btn">Start Meditation</button>
  </div>
</template>

<script>
export default {
  name: "MeditationLibrary",
};
</script>

<style scoped>
.meditation {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  color: #3498db;
}

p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.btn {
  padding: 1rem 2rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #2980b9;
}
</style>
