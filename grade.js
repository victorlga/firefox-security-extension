document.addEventListener('DOMContentLoaded', function() {
    const gradeDisplay = document.getElementById('grade');
    const checkGradeButton = document.getElementById('checkGrade');

    // Function to fetch the grade from the background script
    function fetchGrade() {
        chrome.runtime.sendMessage({action: "calculateGrade"}, function(response) {
            if (response && response.grade) {
                gradeDisplay.textContent = `Your Privacy Grade: ${response.grade}`;
            } else {
                gradeDisplay.textContent = 'Failed to calculate grade.';
            }
        });
    }

    // Event listener for the button
    checkGradeButton.addEventListener('click', function() {
        gradeDisplay.textContent = 'Calculating...';
        fetchGrade();
    });
});
