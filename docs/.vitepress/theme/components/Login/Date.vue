<template>
	<div>
		<div class="article">您当前访问的是私密文章，请输入用户名和密码</div>
		<div class="getDate">
			{{ currentDate }}
		</div>
	</div>
</template>

<script>
export default {
  name: 'currentDate',
  data() {
    return {
      currentDate: '',
    };
  },
  mounted() {
    this.getCurrentDate();
  },
  methods: {
    getCurrentDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      this.currentDate = `${ year }-${ month }-${ day }`;
    },
  },
};
</script>

<style scoped>
.getDate {
  color: red;
  margin: 10px auto;
  width: 100px;
}

.article {
  color: red;
  margin: auto 10px;
  display: flex;
  justify-content: center;
  /* padding-left: 8px;
  width: 400px; */
}

</style>