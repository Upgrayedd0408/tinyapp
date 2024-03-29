const { assert } = require('chai');

const { getUserByEmail } = require('../helpers');

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

// console.log(getUserByEmail("user@example.com", testUsers));


describe('getUserByEmail', () => {
  it("should return a user with valid email", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";

    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return null if user not found', () => {
    const user = getUserByEmail("user123@example.com", testUsers);
    const expectedUserID = null;

    assert.strictEqual(user, expectedUserID);
  });
});