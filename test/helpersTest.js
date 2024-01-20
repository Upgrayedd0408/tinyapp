const { assert } = require('chai');

const { findUserByEmail } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

console.log(findUserByEmail("user@example.com", testUsers));


describe('findUserByEmail', () => {
  it("should return a user with valid email", () => {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";

    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return undefined if user not found', () => {
    const user = findUserByEmail("user123@example.com", testUsers);
    const expectedUserID = null;

    assert.strictEqual(user, expectedUserID);
  });
});