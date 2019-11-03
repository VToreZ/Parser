class User {
  constructor(name) {
    this.name = name;
    this.viewers = undefined;
    User.count += 1;
  }

  sayHello(who) {
    console.log(`Hello, ${who.name}`);
  };
};

User.count = 0;



module.exports = User;
