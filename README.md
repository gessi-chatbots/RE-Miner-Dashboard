# RE-Miner Dashboard

The **RE-Miner Dashboard** is a core component of **RE-Miner 2.0**, part of the broader **RE-Miner Ecosystem**. 

It provides an intuitive UI for users to interact with the RE-Miner 2.0 backend for data analysis, visualization, and NLP-based insights.

## RE-Miner 2.0 Architecture

The structure of **RE-Miner 2.0** is illustrated in the diagram below:

![RE-Miner-2.0](src/assets/static/images/RE-Miner-2.0.png)


💡 **Key Note:** While the dashboard enhances usability, it is **not strictly required**—users can interact directly with the backend via its API.

---

## ✨ Key Features

✅ **Web-based UI** – Easy-to-use interface for interacting with RE-Miner 2.0.  
✅ **Seamless API Communication** – Connects with the backend effortlessly.  
✅ **Data Visualization** – Graphs, charts, and analytics for enhanced insights.  
✅ **Extensibility** – Built to integrate future RE-Miner ecosystem expansions.

---

## 📸 Screenshots & Demo

Here are some visuals showcasing the RE-Miner Dashboard:

### 🔹 Main Dashboard View
![Dashboard Screenshot](screenshots/dashboard-screenshot.png)

### 🔹 Review Analyzer
![Single Review Analysis](screenshots/single-review-analysis.png)

### 🔹 Batch Review Analytics (GIF Demo)
![Batch Review GIF](screenshots/batch-review-demo.gif)

### 🔹 Feature Clustering (GIF Demo)
![Feature Clustering GIF](screenshots/batch-review-demo.gif)

### 🎥 Video Demo
A full demo is available on [YouTube](https://www.youtube.com/watch?v=a11bHSCYqqM).

---
## 🛠 Dependencies
The frontend requires the following dependencies to function properly:

- 🔗 **[RE-Miner Dashboard BFF (Backend for Frontend)](https://github.com/gessi-chatbots/RE-Miner-Dashboard-BFF)** – An intermediary layer for API communication.
- 🔗 **[MApp-KG](https://github.com/gessi-chatbots/app_data_repository)** – An RDF-based knowledge graph that integrates a catalog of mobile applications and user reviews.
- 🔗 **[RE-Miner HUB](https://github.com/gessi-chatbots/RE-Miner-Hub)** – The central integration point connecting the core layer with the outer layers. It facilitates communication within the RE-Miner 2.0 ecosystem and is essential for performing all RE-Miner 2.0 tasks.
- **SQL Database** – Stores structured data (e.g., user information).

⚠ **Note:** To install all dependencies at once, you can use the **[RE-Miner Orchestrator](https://github.com/gessi-chatbots/RE-Miner-Orchestrator)**.

---

## 📦 How to Install

### Frontend Setup (React)

1. Clone the repository:
```bash
git clone https://github.com/gessi-chatbots/RE-Miner-Dashboard
cd RE-Miner-Dashboard
```
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm start
```

### Backend Setup (Flask)

1. Clone the repository:
```bash
git clone https://github.com/gessi-chatbots/RE-Miner-Backend
cd RE-Miner-Backend
```
2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scriptsctivate
```
3. Install dependencies:
```bash
pip install -r requirements.txt
```
4. Run the backend server:
```bash
flask run --port=3005
```

---

## 🚀 How to Deploy

### Deploying Frontend
#### Manually
1. Build the production version:
```bash
npm run build
```
2. Serve the app (example using `serve`):
```bash
serve -s build
```
#### Docker
1. Build the Docker image:
```bash
docker build -t re-miner-dashboard .
```
2. Run the container:
```bash
docker run -d -p 3000:3000 re-miner-dashboard
```
### Deploying Backend
#### Manually 
1. Run the Flask application in production using Gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:3005 app:app
```
#### Docker
1. Build the Docker image:
```bash
docker build -t re-miner-backend .
```
2. Run the container:
```bash
docker run -d -p 3005:3005 re-miner-backend
```
---

## 📜 License

This project is licensed under the **[GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html)**.  
For more details, see the [`LICENSE.md`](LICENSE.md) file.

---

🔗 **Developed by [GESSI - NLP4SE](https://gessi.upc.edu/en/research-areas/nlp4se)**  
