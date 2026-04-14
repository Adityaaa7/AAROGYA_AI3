// Triggered when user uploads PDF and clicks "Analyze"
function analyzePDF() {
  const file = document.getElementById("pdfFile").files[0];
  if (!file) return alert("Please upload a PDF first.");

  const formData = new FormData();
  formData.append("pdf", file);

  fetch("/analyze", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      const summary = data.summary;
      displaySummary(summary);
    })
    .catch((err) => {
      alert("❌ Error analyzing the PDF.");
      console.error(err);
    });
}

// Renders the summary (chart + table)
function displaySummary(summary) {
  const chartCanvas = document.getElementById("chart");
  const table = document.getElementById("summaryTable");

  const labels = Object.keys(summary.values);
  const values = Object.values(summary.values);
  const severities = summary.severity;

  const barColors = labels.map((test) => {
    const sev = severities[test];
    if (sev === "Low") return "#ff9999";
    if (sev === "High") return "#ffcc99";
    return "#9CFFBD";
  });

  // Destroy existing chart if any
  if (window.myChart) {
    window.myChart.destroy();
  }

  // Create bar chart
  window.myChart = new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Lab Test Values",
          data: values,
          backgroundColor: barColors,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 90,
            minRotation: 45,
          },
        },
      },
    },
  });

  // Generate table
  table.innerHTML = `<tr><th>Test</th><th>Value</th><th>Severity</th></tr>`;
  labels.forEach((test) => {
    const val = summary.values[test];
    const sev = severities[test];
    table.innerHTML += `<tr><td>${test}</td><td>${val}</td><td>${sev}</td></tr>`;
  });
}

// Chat interface logic
function sendMessage() {
  const input = document.getElementById("chatInput");
  const chatBox = document.getElementById("chatBox");
  const message = input.value.trim();
  if (!message) return;

  // Show user message
  chatBox.innerHTML += `<div class='msg user'><b>You:</b> ${message}</div>`;
  input.value = "";

  // Send to backend
  fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  })
    .then((res) => res.json())
    .then((data) => {
      chatBox.innerHTML += `<div class='msg bot'><b>Bot:</b> ${data.reply}</div>`;
      chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// Send message on Enter key
document.getElementById("chatInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") sendMessage();
});
