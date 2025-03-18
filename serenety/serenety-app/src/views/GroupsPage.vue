<template>
  <div class="groups">
    <h1>Your Groups</h1>
    <p>Explore and manage your groups here.</p>
    <button class="btn">Create New Group</button>
  </div>
</template>

<script>
export default {
  name: "GroupsPage",
};
</script>

<style scoped>
.groups {
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
