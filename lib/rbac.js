function getRole(requestId, resource) {
  if (requestId === resource.owner) {
    return 'owner';
  } else if (resource.friends && resource.friends.indexOf(requestId) > -1) {
    return 'friend';
  }
  return 'other';
}

module.exports = { getRole };
