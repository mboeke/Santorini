/**
 * User model
 */
class User {
  constructor(data = {}) {
    this.id = null;
    this.name = null;
    this.username = null;
    this.password = null;
    this.token = null;
    this.status = null;
    this.birthday = new Date();
    this.games = null;
    this.moves = null;
    Object.assign(this, data);
  }
}
export default User;
