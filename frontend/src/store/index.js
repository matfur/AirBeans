import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    apiURL: 'http://localhost:5000',
    ui: {
      showMenu: false,
      showCart: false,
      menuLeafOverlay: false
    },
    coffees: Array,
    cart: [],
    orders: [],
    orderHistory: [],
    user: []
  },
  mutations: {
    getToken() {
      let token = sessionStorage.getItem('auth');
      this.state.user = token
      return token
    },
    updateProducts(state, products){
      state.coffees = products
    },
    orderHistory(state, products){
      state.orderHistory = products
    },
    toggleMenu(state){
      state.ui.showMenu = !state.ui.showMenu;
    },
    toggleCart(state){
      state.ui.showCart = !state.ui.showCart;
    },
    addToCart(state, product){
      let index = state.cart.findIndex(item => item.id === product.id)
      if(index === -1) {
        product.quantity = 1

        state.cart.push(product)
        console.log(product)
      }
      console.log('this is the cart',this.cart)
    },
    increaseItem(state, product) {
      const index = state.cart.findIndex(item => item.id === product.id);
      product.quantity++;
      Vue.set(state.cart, index, product);
    },
    decreaseItem(state, product) {
      let index = state.cart.findIndex(item => item.id === product.id)
      let item = state.cart[index]
      if (item.quantity > 1) {
        product.quantity--;
        Vue.set(state.cart, index, product);
      } else {
        state.cart.splice(index, 1)
      }
    },
    currentSignedInUser(state, user) {
      state.user = user
      console.log('currentSignedInUser', user)
    }

  },
  actions: {
    async fetchProducts(ctx){
      try{
        let resp = await fetch(`${ctx.state.apiURL}/menu`)
        let data = await resp.json()

        console.log(data)
        ctx.commit('updateProducts', data)
      }
      catch(err){
        console.error(err)
      }
    },
    async placeOrder(ctx){
      let currentDate = new Date().getTime();

      let user = JSON.parse(sessionStorage.getItem('user'));

      if(user === null) {
        user = {name: undefined}
      }

      let totalCost = 0;

      for(let i = 0; i < ctx.state.cart.length; i++) {
        totalCost += ctx.state.cart[i].price * ctx.state.cart[i].quantity;
      }

      let cart = {user: user.name, totalCost: totalCost, orderDate: currentDate, cartItems: ctx.state.cart}
      let settings = {
        method: 'POST',
        body: JSON.stringify(cart),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }
      }
      let resp = await fetch(`${ctx.state.apiURL}/orders`, settings)
      let data = await resp.json();

      if(!data.signedIn) {
        let cart = {purchase: data.orderNr ,totalCost: totalCost, orderDate: currentDate, cartItems: ctx.state.cart}
        sessionStorage.setItem('NoUserOrder', JSON.stringify(cart))

      }
      ctx.state.orders.push(data.orderNr)
      ctx.state.ui.showCart = false
      ctx.state.cart = []
      return data
    },
    async fetchOrders(ctx){
      try{
        let user = JSON.parse(sessionStorage.user)
        console.log('------------------------------', user.name)
        let resp = await fetch(`${ctx.state.apiURL}/profile?user=${user.name}`)
        let data = await resp.json()

        console.log('fetching orders',data)
        if(sessionStorage.user) {

          ctx.commit('orderHistory', data)
        }
      }
      catch(err){
        console.error(err)
      }
    },
    updateCart(ctx, product) {
      ctx.commit('addToCart', product)
    },
    async isLoggedIn(ctx) {
      let checkToken = await ctx.commit('getToken')
      console.log(checkToken)
      const token = await this.state.user;
      const url = 'http://localhost:5000/api/auth/isloggedin';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      const data = await response.json();
      console.log('this is the isLoggedin data',data)
      if (data.isLoggedIn) {
        console.log('Yes! youre logged in!');
      }
    },
    async getUser(ctx) {
      try{
        let user = JSON.parse(sessionStorage.user)
        let resp = await fetch(`${ctx.state.apiURL}/users?user=${user.name}`)
        let data = await resp.json()

        console.log('this is your user',data)
        //let user = {name: data.name, mail: data.mail}
        ctx.commit('currentSignedInUser', data)
      }
      catch(err){
        console.error(err)
      }
    },
    async createUser(ctx, userInfo) {

      // lägger användare i session storage
      console.log('YOURE LOOKING FOR THIS LINE --------------', userInfo)
      sessionStorage.setItem('user', JSON.stringify(userInfo))

      // kolla om det finns en order i session storage

      let user = {name: userInfo.name, mail: userInfo.mail}
      if(sessionStorage.getItem('NoUserOrder')) {
        user.history = [JSON.parse(sessionStorage.getItem('NoUserOrder'))]
      }
      let settings = {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }
      }
      let resp = await fetch(`${ctx.state.apiURL}/profile/create`, settings)
      let data = await resp.json();

      // skicka användare till databasen, skicka med session storage order om det finns en
      console.log('here is the thing i want to look at ------------------',data, user)

      sessionStorage.removeItem('NoUserOrder')
    }
  },
  modules: {
  },
  getters: {
    coffees: state => {
      return state.coffees
    },
    cart: state => {
      return state.cart
    },
    totalCart: state => {
      //let sum = 0;
      let cartLength = 0
      state.cart.forEach(item => {
        cartLength += item.quantity;
      });
      return cartLength;
    },
    currentOrder: state => {
      let index = state.orders.length -1
      return state.orders[index]
    }
  }
})
