// Sample talents data (replace with your actual talents data)
const talentsData = {
    class1: [
      { name: 'Vaření', description: 'var 1' },
      { name: 'Talent 2', description: 'Description for Talent 2' },
      // ... more talents for Class 1
    ],
    class2: [
      { name: 'Talent A', description: 'Description for Talent A' },
      { name: 'Talent B', description: 'Description for Talent B' },
      // ... more talents for Class 2
    ],
    // ... talents for other classes
  };

// Add event listeners to class switcher buttons
const classButtons = document.querySelectorAll('.class-switcher button');
classButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove active class from all buttons
    classButtons.forEach(btn => btn.classList.remove('active'));
    // Add active class to the clicked button
    button.classList.add('active');

    // Get the selected class
    const selectedClass = button.textContent;

    // Fetch talents for the selected class
    const talents = talentsData[selectedClass.replace(' ', '').toLowerCase()];

    // Render talents
    renderTalents(talents);
  });
});

// Render talents in the talent selection area
function renderTalents(talents) {
  const talentSelection = document.querySelector('.talent-selection');
  talentSelection.innerHTML = '';

  talents.forEach(talent => {
    const talentButton = document.createElement('button');
    talentButton.classList.add('talent-button');
    talentButton.textContent = talent.name;
    talentButton.addEventListener('click', () => {
      // Toggle the selection of the talent
      talentButton.classList.toggle('selected');
      // You can add further logic here to handle the selected talents
    });

    talentSelection.appendChild(talentButton);
  });
}

// Load talents for the first class on page load
classButtons[0].click();