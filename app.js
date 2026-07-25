const SUPABASE_URL = "https://qakqtrdmeivnaessvido.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_pXD5YsTfZqpwaauLOJxqEQ_W8mP_bFy";
const HOUSEHOLD_ID = "2c9af8db-e2fd-45e1-85f3-4153e32af005";
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;
const STORAGE_KEYS = {
  items: "freshKeep.items",
  commonFoods: "freshKeep.commonFoods",
  meals: "freshKeep.meals",
  neededItems: "freshKeep.neededItems"
};

const EXPIRING_SOON_DAYS = 3;
const storageLocations = ["Chest Freezer", "Freezer", "Fridge", "Cupboard", "Snacks"];
const locationAliases = {
  Pantry: "Cupboard",
  Counter: "Snacks"
};

const defaultCommonFoods = [
  "Milk",
  "Eggs",
  "Bread",
  "Spinach",
  "Chicken",
  "Yogurt",
  "Cheese",
  "Rice"
];

const sampleItems = [
  { name: "Milk", expiryDate: offsetDate(1), location: "Fridge", notes: "Opened yesterday" },
  { name: "Frozen peas", expiryDate: offsetDate(42), location: "Freezer", notes: "" },
  { name: "Leftover curry", expiryDate: offsetDate(0), location: "Fridge", notes: "Lunch portion" },
  { name: "Pasta", expiryDate: offsetDate(120), location: "Cupboard", notes: "Whole wheat" },
  { name: "Ice cream", expiryDate: offsetDate(28), location: "Chest Freezer", notes: "" },
  { name: "Granola bars", expiryDate: offsetDate(90), location: "Snacks", notes: "School snacks" }
];

const state = {
  items: readStorage(STORAGE_KEYS.items, []),
  commonFoods: readStorage(STORAGE_KEYS.commonFoods, defaultCommonFoods),
  meals: readStorage(STORAGE_KEYS.meals, []),
  neededItems: readStorage(STORAGE_KEYS.neededItems, []),
  search: "",
  filter: "all",
  sort: "expiryAsc",
  mealSearch: "",
  favouritesOnly: false,
  pickerFavouritesOnly: false,
  recentDays: 0,
  mealIngredients: []
};

const itemForm = document.querySelector("#itemForm");
const itemIdInput = document.querySelector("#itemId");
const foodNameInput = document.querySelector("#foodName");
const expiryDateInput = document.querySelector("#expiryDate");
const locationInput = document.querySelector("#location");
const notesInput = document.querySelector("#notes");
const saveItemButton = document.querySelector("#saveItemButton");
const resetFormButton = document.querySelector("#resetFormButton");
const inventoryList = document.querySelector("#inventoryList");
const emptyState = document.querySelector("#emptyState");
const itemTemplate = document.querySelector("#itemTemplate");
const searchInput = document.querySelector("#searchInput");
const filterSelect = document.querySelector("#filterSelect");
const sortSelect = document.querySelector("#sortSelect");
const totalCount = document.querySelector("#totalCount");
const expiringCount = document.querySelector("#expiringCount");
const dashboardGrid = document.querySelector("#dashboardGrid");
const commonForm = document.querySelector("#commonForm");
const commonFoodInput = document.querySelector("#commonFoodInput");
const commonFoodList = document.querySelector("#commonFoodList");
const commonFoodOptions = document.querySelector("#commonFoodOptions");
const seedButton = document.querySelector("#seedButton");
const locationPie = document.querySelector("#locationPie");
const locationLegend = document.querySelector("#locationLegend");
const navButtons = document.querySelectorAll(".nav-button");
const appPages = document.querySelectorAll(".app-page");
const mealForm = document.querySelector("#mealForm");
const mealIdInput = document.querySelector("#mealId");
const mealNameInput = document.querySelector("#mealName");
const mealCategoryInput = document.querySelector("#mealCategory");
const mealIngredientInput = document.querySelector("#mealIngredientInput");
const addMealIngredientButton = document.querySelector("#addMealIngredientButton");
const mealIngredientList = document.querySelector("#mealIngredientList");
const mealNotesInput = document.querySelector("#mealNotes");
const mealFavouriteInput = document.querySelector("#mealFavourite");
const saveMealButton = document.querySelector("#saveMealButton");
const resetMealButton = document.querySelector("#resetMealButton");
const mealSearchInput = document.querySelector("#mealSearchInput");
const favouritesOnlyFilter = document.querySelector("#favouritesOnlyFilter");
const mealList = document.querySelector("#mealList");
const mealEmptyState = document.querySelector("#mealEmptyState");
const mealTemplate = document.querySelector("#mealTemplate");
const pickDinnerButton = document.querySelector("#pickDinnerButton");
const pickerFavouritesOnly = document.querySelector("#pickerFavouritesOnly");
const recentDaysSelect = document.querySelector("#recentDaysSelect");
const suggestionBox = document.querySelector("#suggestionBox");
const neededList = document.querySelector("#neededList");
const neededEmptyState = document.querySelector("#neededEmptyState");
const clearNeededButton = document.querySelector("#clearNeededButton");
const canMakeList = document.querySelector("#canMakeList");
const almostMakeList = document.querySelector("#almostMakeList");
const notAvailableList = document.querySelector("#notAvailableList");
const authForm = document.querySelector("#authForm");
const authEmailInput = document.querySelector("#authEmail");
const authStatus = document.querySelector("#authStatus");
const signOutButton = document.querySelector("#signOutButton");
const importLocalButton = document.querySelector("#importLocalButton");

navButtons.forEach(button => button.addEventListener("click", () => showPage(button.dataset.page)));
itemForm.addEventListener("submit", saveItem);
resetFormButton.addEventListener("click", resetItemForm);
searchInput.addEventListener("input", event => {
  state.search = event.target.value.trim().toLowerCase();
  renderInventory();
});
filterSelect.addEventListener("change", event => {
  state.filter = event.target.value;
  renderInventory();
});
sortSelect.addEventListener("change", event => {
  state.sort = event.target.value;
  renderInventory();
});
commonForm.addEventListener("submit", addCommonFood);
seedButton.addEventListener("click", addSampleItems);
mealForm.addEventListener("submit", saveMeal);
addMealIngredientButton.addEventListener("click", addMealIngredientFromInput);
mealIngredientInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    addMealIngredientFromInput();
  }
});
resetMealButton.addEventListener("click", resetMealForm);
mealSearchInput.addEventListener("input", event => {
  state.mealSearch = event.target.value.trim().toLowerCase();
  renderMeals();
});
favouritesOnlyFilter.addEventListener("change", event => {
  state.favouritesOnly = event.target.checked;
  renderMeals();
});
pickerFavouritesOnly.addEventListener("change", event => {
  state.pickerFavouritesOnly = event.target.checked;
  renderIdeas();
});
recentDaysSelect.addEventListener("change", event => {
  state.recentDays = Number(event.target.value);
  renderIdeas();
});
pickDinnerButton.addEventListener("click", pickDinner);
clearNeededButton.addEventListener("click", clearNeededItems);
if (authForm) authForm.addEventListener("submit", sendMagicLink);
if (signOutButton) signOutButton.addEventListener("click", signOut);
if (importLocalButton) importLocalButton.addEventListener("click", uploadLocalData);

normalizeStoredLocations();
render();

async function saveItem(event) {
  event.preventDefault();

  const item = {
    id: itemIdInput.value || createId(),
    name: foodNameInput.value.trim(),
    expiryDate: expiryDateInput.value,
    location: normalizeLocation(locationInput.value),
    notes: notesInput.value.trim(),
    createdAt: getExistingCreatedAt(itemIdInput.value),
    updatedAt: new Date().toISOString()
  };

  if (!item.name || !item.expiryDate) return;

  const existingIndex = state.items.findIndex(food => food.id === item.id);
  if (existingIndex >= 0) {
    state.items[existingIndex] = item;
  } else {
    state.items.push(item);
  }

  await addCommonFoodValue(item.name);
  await persist();
  resetItemForm();
  render();
}

function showPage(pageId) {
  appPages.forEach(page => {
    const isActive = page.id === pageId;
    page.hidden = !isActive;
    page.classList.toggle("active", isActive);
  });

  navButtons.forEach(button => button.classList.toggle("active", button.dataset.page === pageId));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function editItem(id) {
  const item = state.items.find(food => food.id === id);
  if (!item) return;

  itemIdInput.value = item.id;
  foodNameInput.value = item.name;
  expiryDateInput.value = item.expiryDate;
  locationInput.value = item.location;
  notesInput.value = item.notes;
  saveItemButton.textContent = "Save changes";
  foodNameInput.focus();
}

async function removeItem(id) {
  state.items = state.items.filter(food => food.id !== id);
  await persistItems();
  render();
}

function resetItemForm() {
  itemForm.reset();
  itemIdInput.value = "";
  locationInput.value = "Fridge";
  saveItemButton.textContent = "Add item";
}

async function addCommonFood(event) {
  event.preventDefault();
  await addCommonFoodValue(commonFoodInput.value);
  commonFoodInput.value = "";
  await persistCommonFoods();
  renderCommonFoods();
}

async function addCommonFoodValue(value) {
  const name = value.trim();
  if (!name) return;

  const exists = state.commonFoods.some(food => food.toLowerCase() === name.toLowerCase());
  if (!exists) {
    state.commonFoods.push(titleCase(name));
    state.commonFoods.sort((a, b) => a.localeCompare(b));
    await persistCommonFoods();
  }
}

async function saveMeal(event) {
  event.preventDefault();

  const ingredients = uniqueValues(state.mealIngredients);
  const meal = {
    id: mealIdInput.value || createId(),
    name: mealNameInput.value.trim(),
    category: mealCategoryInput.value,
    ingredients,
    notes: mealNotesInput.value.trim(),
    favourite: mealFavouriteInput.checked,
    cookedCount: getExistingMealStat(mealIdInput.value, "cookedCount", 0),
    lastCooked: getExistingMealStat(mealIdInput.value, "lastCooked", ""),
    updatedAt: new Date().toISOString()
  };

  if (!meal.name || meal.ingredients.length === 0) return;

  for (const ingredient of meal.ingredients) await addCommonFoodValue(ingredient);
  const existingIndex = state.meals.findIndex(existingMeal => existingMeal.id === meal.id);
  if (existingIndex >= 0) {
    state.meals[existingIndex] = meal;
  } else {
    state.meals.push(meal);
  }

  await persistMeals();
  resetMealForm();
  render();
}

function editMeal(id) {
  const meal = state.meals.find(item => item.id === id);
  if (!meal) return;

  showPage("mealsPage");
  mealIdInput.value = meal.id;
  mealNameInput.value = meal.name;
  mealCategoryInput.value = meal.category;
  state.mealIngredients = [...meal.ingredients];
  mealNotesInput.value = meal.notes || "";
  mealFavouriteInput.checked = Boolean(meal.favourite);
  saveMealButton.textContent = "Save meal";
  renderMealIngredientChips();
  mealNameInput.focus();
}

async function deleteMeal(id) {
  state.meals = state.meals.filter(meal => meal.id !== id);
  await persistMeals();
  render();
}

async function toggleFavourite(id) {
  const meal = state.meals.find(item => item.id === id);
  if (!meal) return;
  meal.favourite = !meal.favourite;
  meal.updatedAt = new Date().toISOString();
  await persistMeals();
  render();
}

async function markCooked(id) {
  const meal = state.meals.find(item => item.id === id);
  if (!meal) return;
  meal.cookedCount = Number(meal.cookedCount || 0) + 1;
  meal.lastCooked = todayValue();
  await persistMeals();
  render();
}

async function addMealIngredientFromInput() {
  const value = mealIngredientInput.value.trim();
  if (!value) return;

  await addCommonFoodValue(value);
  state.mealIngredients = uniqueValues([...state.mealIngredients, titleCase(value)]);
  mealIngredientInput.value = "";
  renderMealIngredientChips();
  renderCommonFoods();
}

function removeMealIngredient(ingredient) {
  state.mealIngredients = state.mealIngredients.filter(item => normalizeName(item) !== normalizeName(ingredient));
  renderMealIngredientChips();
}

function resetMealForm() {
  mealForm.reset();
  mealIdInput.value = "";
  mealCategoryInput.value = "Dinner";
  state.mealIngredients = [];
  saveMealButton.textContent = "Save meal";
  renderMealIngredientChips();
}

async function removeCommonFood(foodName) {
  state.commonFoods = state.commonFoods.filter(food => food !== foodName);
  await persistCommonFoods();
  renderCommonFoods();
}

async function addSampleItems() {
  const samples = sampleItems.map(item => ({
    ...item,
    id: createId(),
    createdAt: todayValue(),
    updatedAt: new Date().toISOString()
  }));
  state.items = [...state.items, ...samples];
  await persistItems();
  render();
}

function render() {
  renderDashboard();
  renderInventory();
  renderCommonFoods();
  renderMeals();
  renderIdeas();
  renderNeededItems();
}

function renderDashboard() {
  dashboardGrid.replaceChildren();
  locationLegend.replaceChildren();

  const totals = storageLocations.map(location => ({
    location,
    count: state.items.filter(item => normalizeLocation(item.location) === location).length
  }));
  const totalCount = totals.reduce((sum, item) => sum + item.count, 0);
  renderLocationPie(totals, totalCount);

  totals.forEach(({ location }) => {
    const items = state.items.filter(item => normalizeLocation(item.location) === location);
    const soonCount = items.filter(item => {
      const status = getExpiryStatus(item.expiryDate);
      return status.kind === "soon" || status.kind === "expired";
    }).length;
    const nextItem = [...items].sort((a, b) => dateValue(a.expiryDate) - dateValue(b.expiryDate))[0];

    const button = document.createElement("button");
    button.className = "dashboard-card";
    button.type = "button";
    button.addEventListener("click", () => {
      state.search = location.toLowerCase();
      searchInput.value = location;
      state.filter = "all";
      filterSelect.value = "all";
      renderInventory();
    });

    const title = document.createElement("span");
    title.className = "dashboard-card__title";
    title.textContent = location;

    const count = document.createElement("strong");
    count.className = "dashboard-card__count";
    count.textContent = items.length;

    const detail = document.createElement("span");
    detail.className = "dashboard-card__detail";
    detail.textContent = getDashboardDetail(items.length, soonCount, nextItem);

    button.append(title, count, detail);
    dashboardGrid.append(button);
  });
}

function renderLocationPie(totals, totalCount) {
  if (totalCount === 0) {
    locationPie.style.background = "rgba(226, 244, 255, 0.78)";
    locationPie.dataset.total = "0";
    locationPie.setAttribute("aria-label", "No food items yet");
  } else {
    let start = 0;
    const segments = totals.filter(item => item.count > 0).map(item => {
      const locationIndex = storageLocations.indexOf(item.location);
      const size = item.count / totalCount * 100;
      const end = start + size;
      const segment = `${getLocationColor(locationIndex)} ${start}% ${end}%`;
      start = end;
      return segment;
    });

    locationPie.style.background = `conic-gradient(${segments.join(", ")})`;
    locationPie.dataset.total = String(totalCount);
    locationPie.setAttribute("aria-label", `${totalCount} food items split by location`);
  }

  totals.forEach((item, index) => {
    const legendItem = document.createElement("span");
    legendItem.className = "legend-item";

    const dot = document.createElement("span");
    dot.className = "legend-dot";
    dot.style.background = getLocationColor(index);

    const label = document.createElement("span");
    label.textContent = `${item.location}: ${item.count}`;

    legendItem.append(dot, label);
    locationLegend.append(legendItem);
  });
}

function renderInventory() {
  inventoryList.replaceChildren();

  const visibleItems = getVisibleItems();
  emptyState.hidden = visibleItems.length > 0;

  visibleItems.forEach(item => {
    const card = itemTemplate.content.firstElementChild.cloneNode(true);
    const status = getExpiryStatus(item.expiryDate);
    card.classList.add(status.kind);
    card.querySelector(".food-name").textContent = item.name;
    card.querySelector(".food-meta").textContent = item.location;
    card.querySelector(".status-pill").textContent = status.label;
    card.querySelector(".expiry-date").textContent = formatDate(item.expiryDate);

    const notes = card.querySelector(".food-notes");
    notes.textContent = item.notes || "No notes";
    notes.hidden = !item.notes;

    const addedDateInput = card.querySelector(".added-date-input");
    addedDateInput.value = normalizeDateValue(item.createdAt || item.updatedAt || todayValue());
    addedDateInput.addEventListener("change", event => updateAddedDate(item.id, event.target.value));

    card.querySelector(".edit-button").addEventListener("click", () => editItem(item.id));
    card.querySelector(".remove-button").addEventListener("click", () => removeItem(item.id));
    inventoryList.append(card);
  });

  const soonCount = state.items.filter(item => {
    const status = getExpiryStatus(item.expiryDate);
    return status.kind === "soon" || status.kind === "expired";
  }).length;

  totalCount.textContent = `${state.items.length} ${state.items.length === 1 ? "item" : "items"}`;
  expiringCount.textContent = `${soonCount} soon`;
}

function renderCommonFoods() {
  commonFoodList.replaceChildren();
  commonFoodOptions.replaceChildren();

  state.commonFoods.forEach(food => {
    const option = document.createElement("option");
    option.value = food;
    commonFoodOptions.append(option);

    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = food;

    const button = document.createElement("button");
    button.type = "button";
    button.title = `Remove ${food}`;
    button.setAttribute("aria-label", `Remove ${food}`);
    button.textContent = "x";
    button.addEventListener("click", () => removeCommonFood(food));

    chip.append(button);
    commonFoodList.append(chip);
  });
}

function renderMealIngredientChips() {
  mealIngredientList.replaceChildren();
  state.mealIngredients.forEach(ingredient => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = ingredient;

    const button = document.createElement("button");
    button.type = "button";
    button.title = `Remove ${ingredient}`;
    button.setAttribute("aria-label", `Remove ${ingredient}`);
    button.textContent = "x";
    button.addEventListener("click", () => removeMealIngredient(ingredient));

    chip.append(button);
    mealIngredientList.append(chip);
  });
}

function renderMeals() {
  mealList.replaceChildren();
  const meals = getFilteredMeals();
  mealEmptyState.hidden = meals.length > 0;
  meals.forEach(meal => mealList.append(createMealCard(meal, "manage")));
}

function renderIdeas() {
  const grouped = getMealMatches();
  canMakeList.replaceChildren();
  almostMakeList.replaceChildren();
  notAvailableList.replaceChildren();

  grouped.ready.forEach(match => canMakeList.append(createMealCard(match.meal, "ideas", match)));
  grouped.almost.forEach(match => almostMakeList.append(createMealCard(match.meal, "ideas", match)));
  grouped.unavailable.forEach(match => notAvailableList.append(createMealCard(match.meal, "ideas", match)));

  addGroupEmpty(canMakeList, "No ready meals yet.");
  addGroupEmpty(almostMakeList, "No almost-ready meals yet.");
  addGroupEmpty(notAvailableList, "No unavailable meals yet.");
}

function createMealCard(meal, mode, existingMatch) {
  const card = mealTemplate.content.firstElementChild.cloneNode(true);
  const match = existingMatch || getMealMatch(meal);
  card.classList.add(match.status);
  card.querySelector(".meal-name").textContent = meal.name;
  card.querySelector(".meal-meta").textContent = meal.category;

  const favouriteButton = card.querySelector(".favourite-button");
  favouriteButton.textContent = meal.favourite ? "★" : "☆";
  favouriteButton.classList.toggle("active", Boolean(meal.favourite));
  favouriteButton.addEventListener("click", () => toggleFavourite(meal.id));

  card.querySelector(".match-panel").textContent = getMatchLabel(match);
  renderIngredientMatchList(card.querySelector(".ingredient-match-list"), match);

  const notes = card.querySelector(".meal-notes");
  notes.textContent = meal.notes || "";
  notes.hidden = !meal.notes;

  card.querySelector(".meal-stats").textContent = getMealStats(meal);
  card.querySelector(".cooked-button").addEventListener("click", () => markCooked(meal.id));
  card.querySelector(".missing-button").addEventListener("click", () => addMissingToNeeded(match.missing));
  card.querySelector(".missing-button").hidden = match.missing.length === 0;
  card.querySelector(".edit-meal-button").addEventListener("click", () => editMeal(meal.id));
  card.querySelector(".delete-meal-button").addEventListener("click", () => deleteMeal(meal.id));

  if (mode === "ideas") {
    card.querySelector(".delete-meal-button").hidden = true;
  }

  return card;
}

function renderIngredientMatchList(list, match) {
  list.replaceChildren();
  match.ingredients.forEach(item => {
    const row = document.createElement("li");
    row.className = item.available ? "available" : "missing";
    row.textContent = `${item.available ? "✓" : "✗"} ${item.name}`;
    list.append(row);
  });
}

function addGroupEmpty(container, message) {
  if (container.children.length > 0) return;
  const empty = document.createElement("p");
  empty.className = "empty-state compact-empty";
  empty.textContent = message;
  container.append(empty);
}

function renderNeededItems() {
  neededList.replaceChildren();
  neededEmptyState.hidden = state.neededItems.length > 0;
  state.neededItems.forEach(item => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = item;

    const button = document.createElement("button");
    button.type = "button";
    button.title = `Remove ${item}`;
    button.setAttribute("aria-label", `Remove ${item}`);
    button.textContent = "x";
    button.addEventListener("click", () => removeNeededItem(item));

    chip.append(button);
    neededList.append(chip);
  });
}

function getVisibleItems() {
  return [...state.items]
    .filter(item => {
      const matchesSearch = [item.name, item.location, item.notes]
        .join(" ")
        .toLowerCase()
        .includes(state.search);
      const status = getExpiryStatus(item.expiryDate);
      const matchesFilter = state.filter === "all" || state.filter === status.kind;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (state.sort === "expiryDesc") return dateValue(b.expiryDate) - dateValue(a.expiryDate);
      if (state.sort === "nameAsc") return a.name.localeCompare(b.name);
      if (state.sort === "locationAsc") return a.location.localeCompare(b.location) || dateValue(a.expiryDate) - dateValue(b.expiryDate);
      return dateValue(a.expiryDate) - dateValue(b.expiryDate);
    });
}

function getFilteredMeals() {
  return [...state.meals]
    .filter(meal => meal.name.toLowerCase().includes(state.mealSearch))
    .filter(meal => !state.favouritesOnly || meal.favourite)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getMealMatches() {
  const matches = state.meals
    .filter(meal => !state.pickerFavouritesOnly || meal.favourite)
    .filter(meal => !wasCookedRecently(meal))
    .map(getMealMatch)
    .sort((a, b) => getMealScore(b) - getMealScore(a));

  return {
    ready: matches.filter(match => match.status === "ready"),
    almost: matches.filter(match => match.status === "almost"),
    unavailable: matches.filter(match => match.status === "unavailable")
  };
}

function getMealMatch(meal) {
  const inventoryNames = new Set(
    state.items
      .filter(item => getExpiryStatus(item.expiryDate).kind !== "expired")
      .map(item => normalizeName(item.name))
  );
  const ingredients = meal.ingredients.map(name => ({
    name,
    available: inventoryNames.has(normalizeName(name))
  }));
  const missing = ingredients.filter(item => !item.available).map(item => item.name);
  const status = missing.length === 0 ? "ready" : missing.length <= 2 ? "almost" : "unavailable";

  return { meal, ingredients, missing, status };
}

function getMatchLabel(match) {
  if (match.status === "ready") return "Ready to cook";
  if (match.status === "almost") return `Missing ${match.missing.length} ingredient${match.missing.length === 1 ? "" : "s"}`;
  return `Missing ${match.missing.length} ingredients`;
}

function getMealScore(match) {
  const favouriteBoost = match.meal.favourite ? 4 : 0;
  const cookedBoost = Math.min(Number(match.meal.cookedCount || 0), 6) * 0.35;
  const availabilityBoost = match.status === "ready" ? 10 : match.status === "almost" ? 5 : 1;
  return availabilityBoost + favouriteBoost + cookedBoost;
}

function pickDinner() {
  const grouped = getMealMatches();
  const pool = grouped.ready.length > 0 ? grouped.ready : grouped.almost.length > 0 ? grouped.almost : grouped.unavailable;

  if (pool.length === 0) {
    suggestionBox.hidden = false;
    suggestionBox.innerHTML = "<strong>Tonight's Suggestion</strong><p>Add a few meals first.</p>";
    return;
  }

  const weightedPool = pool.flatMap(match => Array(Math.max(1, Math.round(getMealScore(match)))) .fill(match));
  const match = weightedPool[Math.floor(Math.random() * weightedPool.length)];
  suggestionBox.hidden = false;
  suggestionBox.innerHTML = "";

  const title = document.createElement("strong");
  title.textContent = "Tonight's Suggestion";
  const name = document.createElement("h3");
  name.textContent = match.meal.name;
  const detail = document.createElement("p");
  detail.textContent = getMatchLabel(match);
  const list = document.createElement("ul");
  list.className = "ingredient-match-list";
  renderIngredientMatchList(list, match);

  suggestionBox.append(title, name, detail, list);
}

async function addMissingToNeeded(missing) {
  state.neededItems = uniqueValues([...state.neededItems, ...missing]);
  await persistNeededItems();
  renderNeededItems();
}

async function removeNeededItem(item) {
  state.neededItems = state.neededItems.filter(existing => normalizeName(existing) !== normalizeName(item));
  await persistNeededItems();
  renderNeededItems();
}

async function clearNeededItems() {
  state.neededItems = [];
  await persistNeededItems();
  renderNeededItems();
}

function wasCookedRecently(meal) {
  if (!state.recentDays || !meal.lastCooked) return false;
  const lastCooked = parseDateValue(meal.lastCooked);
  const cutoff = startOfToday();
  cutoff.setDate(cutoff.getDate() - state.recentDays);
  return lastCooked >= cutoff;
}

function getMealStats(meal) {
  const cookedCount = Number(meal.cookedCount || 0);
  const lastCooked = meal.lastCooked ? `Last cooked: ${formatDate(meal.lastCooked)}` : "Last cooked: never";
  return `${lastCooked} · Cooked ${cookedCount} ${cookedCount === 1 ? "time" : "times"}`;
}

function getExistingMealStat(id, key, fallback) {
  const existing = state.meals.find(meal => meal.id === id);
  return existing ? existing[key] : fallback;
}

function getDashboardDetail(count, soonCount, nextItem) {
  if (count === 0) return "Empty";
  if (soonCount > 0) return `${soonCount} needs attention`;
  return `Next: ${formatDate(nextItem.expiryDate)}`;
}

async function normalizeStoredLocations() {
  let changed = false;
  state.items = state.items.map(item => {
    const location = normalizeLocation(item.location);
    if (location === item.location) return item;
    changed = true;
    return { ...item, location };
  });

  if (changed) await persistItems();
}

function normalizeLocation(location) {
  const normalized = locationAliases[location] || location;
  return storageLocations.includes(normalized) ? normalized : "Cupboard";
}

function getLocationColor(index) {
  return ["#4aa3df", "#9fd6ff", "#7fd8b5", "#ffdca8", "#f7a7b5"][index];
}

async function updateAddedDate(id, value) {
  const item = state.items.find(food => food.id === id);
  if (!item || !value) return;

  item.createdAt = value;
  item.updatedAt = new Date().toISOString();
  await persistItems();
  renderInventory();
}

function getExistingCreatedAt(id) {
  const existing = state.items.find(food => food.id === id);
  return existing ? normalizeDateValue(existing.createdAt || existing.updatedAt || todayValue()) : todayValue();
}

function getExpiryStatus(expiryDate) {
  const today = startOfToday();
  const expiry = parseDateValue(expiryDate);
  const days = Math.ceil((expiry - today) / 86400000);

  if (days < 0) return { kind: "expired", label: "Expired" };
  if (days === 0) return { kind: "soon", label: "Today" };
  if (days <= EXPIRING_SOON_DAYS) return { kind: "soon", label: `${days}d left` };
  return { kind: "ok", label: "Fresh" };
}

async function persist() {
  await persistItems();
  await persistCommonFoods();
}

async function persistItems() {
  writeStorage(STORAGE_KEYS.items, state.items);
  if (isRemoteReady()) await table("food_items").upsert(state.items.map(toRemoteFoodItem), { onConflict: "id" });
}

async function persistCommonFoods() {
  writeStorage(STORAGE_KEYS.commonFoods, state.commonFoods);
  if (!isRemoteReady()) return;
  await table("common_foods").delete().eq("household_id", HOUSEHOLD_ID);
  if (state.commonFoods.length > 0) await table("common_foods").insert(state.commonFoods.map(name => ({ household_id: HOUSEHOLD_ID, name })));
}

async function persistMeals() {
  writeStorage(STORAGE_KEYS.meals, state.meals);
  if (!isRemoteReady()) return;
  const result = await table("meals").upsert(state.meals.map(toRemoteMeal), { onConflict: "id" }).select("id,name");
  if (result.error) return setAuthStatus(`Meal sync error: ${result.error.message}`);
  for (const meal of state.meals.filter(item => isUuid(item.id))) await upsertRemoteMealIngredients(meal);
}

async function persistNeededItems() {
  writeStorage(STORAGE_KEYS.neededItems, state.neededItems);
  if (!isRemoteReady()) return;
  await table("needed_items").delete().eq("household_id", HOUSEHOLD_ID);
  if (state.neededItems.length > 0) await table("needed_items").insert(state.neededItems.map(name => ({ household_id: HOUSEHOLD_ID, name })));
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(parseDateValue(value));
}

function dateValue(value) {
  return parseDateValue(value).getTime();
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeDateValue(value) {
  if (!value) return todayValue();
  return String(value).slice(0, 10);
}

function parseDateValue(value) {
  const [year, month, day] = normalizeDateValue(value).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Safari private browsing or full storage can reject writes.
  }
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, char => {
    const random = Math.floor(Math.random() * 16);
    return (Number(char) ^ random & 15 >> Number(char) / 4).toString(16);
  });
}

function normalizeName(value) {
  return String(value || "").trim().toLowerCase();
}

function uniqueValues(values) {
  const seen = new Set();
  return values
    .map(value => titleCase(String(value || "").trim()))
    .filter(Boolean)
    .filter(value => {
      const normalized = normalizeName(value);
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
}

function titleCase(value) {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function initializeApp() {
  await normalizeStoredLocations();
  render();

  if (!supabaseClient) {
    setAuthStatus("Local only. Supabase client did not load.");
    return;
  }

  if (authForm) authForm.hidden = true;
  if (signOutButton) signOutButton.hidden = true;
  setAuthStatus("Household sync is on. Loading shared data...");
  await loadRemoteData();
  setAuthStatus("Household sync is on.");
}

async function handleSession(session) {
  state.session = session;
  if (!session) {
    setAuthStatus("Not signed in. Data is saved on this device only.");
    if (signOutButton) signOutButton.hidden = true;
    return;
  }

  if (signOutButton) signOutButton.hidden = false;
  setAuthStatus(`Signed in as ${session.user.email}. Loading household data...`);
  await loadRemoteData();
  setAuthStatus(`Signed in as ${session.user.email}. Household sync is on.`);
}

async function sendMagicLink(event) {
  event.preventDefault();
  if (!supabaseClient) return setAuthStatus("Supabase client is not available.");

  const email = authEmailInput.value.trim();
  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href.split("#")[0] }
  });

  setAuthStatus(error ? error.message : "Magic link sent. Check your email on this device.");
}

async function signOut() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  setAuthStatus("Signed out. Data is saved on this device only.");
}

function setAuthStatus(message) {
  if (authStatus) authStatus.textContent = message;
}

function isRemoteReady() {
  return Boolean(supabaseClient);
}

function table(name) {
  return supabaseClient.schema("food_inventory").from(name);
}

async function loadRemoteData() {
  if (!isRemoteReady()) return;

  const [itemsResult, commonResult, mealsResult, ingredientsResult, neededResult] = await Promise.all([
    table("food_items").select("*").eq("household_id", HOUSEHOLD_ID).order("expiry_date", { ascending: true }),
    table("common_foods").select("*").eq("household_id", HOUSEHOLD_ID).order("name", { ascending: true }),
    table("meals").select("*").eq("household_id", HOUSEHOLD_ID).order("name", { ascending: true }),
    table("meal_ingredients").select("*").eq("household_id", HOUSEHOLD_ID),
    table("needed_items").select("*").eq("household_id", HOUSEHOLD_ID).order("name", { ascending: true })
  ]);

  const error = [itemsResult, commonResult, mealsResult, ingredientsResult, neededResult].find(result => result.error)?.error;
  if (error) {
    setAuthStatus(`Sync error: ${error.message}`);
    return;
  }

  state.items = itemsResult.data.map(fromRemoteFoodItem);
  state.commonFoods = commonResult.data.length > 0 ? commonResult.data.map(row => row.name) : state.commonFoods;
  const ingredientsByMeal = ingredientsResult.data.reduce((groups, row) => {
    groups[row.meal_id] = groups[row.meal_id] || [];
    groups[row.meal_id].push(row.ingredient_name);
    return groups;
  }, {});
  state.meals = mealsResult.data.map(row => fromRemoteMeal(row, ingredientsByMeal[row.id] || []));
  state.neededItems = neededResult.data.map(row => row.name);
  writeLocalFallbacks();
  render();
}

async function uploadLocalData() {
  if (!isRemoteReady()) return setAuthStatus("Sign in before uploading local data.");
  setAuthStatus("Uploading local data...");
  await Promise.all([persistItems(), persistCommonFoods(), persistMeals(), persistNeededItems()]);
  await loadRemoteData();
  setAuthStatus("Local data uploaded to household sync.");
}

function writeLocalFallbacks() {
  writeStorage(STORAGE_KEYS.items, state.items);
  writeStorage(STORAGE_KEYS.commonFoods, state.commonFoods);
  writeStorage(STORAGE_KEYS.meals, state.meals);
  writeStorage(STORAGE_KEYS.neededItems, state.neededItems);
}

function toRemoteFoodItem(item) {
  const row = {
    household_id: HOUSEHOLD_ID,
    name: item.name,
    expiry_date: item.expiryDate,
    location: normalizeLocation(item.location),
    notes: item.notes || "",
    added_date: normalizeDateValue(item.createdAt || item.updatedAt || todayValue())
  };
  if (isUuid(item.id)) row.id = item.id;
  return row;
}

function fromRemoteFoodItem(row) {
  return { id: row.id, name: row.name, expiryDate: row.expiry_date, location: row.location, notes: row.notes || "", createdAt: row.added_date, updatedAt: row.updated_at || row.created_at };
}

function toRemoteMeal(meal) {
  const row = { household_id: HOUSEHOLD_ID, name: meal.name, category: meal.category, notes: meal.notes || "", favourite: Boolean(meal.favourite), cooked_count: Number(meal.cookedCount || 0), last_cooked: meal.lastCooked || null };
  if (isUuid(meal.id)) row.id = meal.id;
  return row;
}

function fromRemoteMeal(row, ingredients) {
  return { id: row.id, name: row.name, category: row.category, ingredients, notes: row.notes || "", favourite: Boolean(row.favourite), cookedCount: Number(row.cooked_count || 0), lastCooked: row.last_cooked || "", updatedAt: row.updated_at || row.created_at };
}

async function upsertRemoteMealIngredients(meal) {
  if (!isUuid(meal.id)) return;
  await table("meal_ingredients").delete().eq("meal_id", meal.id);
  if (meal.ingredients.length === 0) return;
  await table("meal_ingredients").insert(meal.ingredients.map(ingredient => ({ household_id: HOUSEHOLD_ID, meal_id: meal.id, ingredient_name: ingredient })));
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}







