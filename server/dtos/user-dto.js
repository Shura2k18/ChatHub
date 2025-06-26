export default class UserDto {
  email
  name
  _id
  imageUrl
  isActivated
  phone
  role
  tag
  blockedUsers

  constructor(model) {
    this.email = model.email
    this.name = model.name
    this._id = model._id
    this.imageUrl = model.imageUrl
    this.isActivated = model.isActivated
    this.phone = model.phone
    this.role = model.role
    this.tag = model.tag
    this.blockedUsers = model.blockedUsers
  }
}
