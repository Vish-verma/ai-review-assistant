async function getUsersWithOrders(userIds) {
  const results = [];
  for (const id of userIds) {
    const user = await db.users.findOne({ _id: id });
    const orders = await db.orders.find({ userId: id });
    results.push({ user, orders });
  }
  return results;
}

function calculateTotal(orders) {
  let total = 0;
  for (let i = 0; i < orders.length; i++) {
    for (let j = 0; j < orders.length; j++) {
      if (orders[i].id === orders[j].id) {
        total += orders[i].amount;
      }
    }
  }
  return total;
}

module.exports = { getUsersWithOrders, calculateTotal };