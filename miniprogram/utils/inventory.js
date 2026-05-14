function calculateInventoryStatus(item) {
  if (item.quantity <= 0) return 'out_of_stock';

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (!item.expireDate) return 'normal';

  const expireDate = new Date(item.expireDate);
  expireDate.setHours(0, 0, 0, 0);

  if (expireDate < now) return 'expired';

  const threeDaysLater = new Date(now);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);

  if (expireDate <= threeDaysLater) return 'expiring';

  return 'normal';
}

function checkRecipeAvailability(recipe, inventory) {
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    return { available: true, missing: [] };
  }

  const missing = [];
  for (const ingredient of recipe.ingredients) {
    const invItem = inventory.find(i => i._id === ingredient.inventoryItemId);
    if (!invItem) {
      missing.push({ name: ingredient.name, required: ingredient.amount, available: 0 });
      continue;
    }
    const status = calculateInventoryStatus(invItem);
    if (status === 'expired' || status === 'out_of_stock') {
      missing.push({ name: ingredient.name, required: ingredient.amount, available: invItem.quantity });
      continue;
    }
    if (invItem.quantity < ingredient.amount) {
      missing.push({ name: ingredient.name, required: ingredient.amount, available: invItem.quantity });
    }
  }

  return { available: missing.length === 0, missing };
}

module.exports = {
  calculateInventoryStatus,
  checkRecipeAvailability,
};
