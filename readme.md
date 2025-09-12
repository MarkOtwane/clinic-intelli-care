# HealthFlow AI 🏥🤖  
**AI-Powered Hospital Management & Smart Patient Routing System**  

## 📌 Introduction  
HealthFlow AI is a **Hospital Management System (HMS)** enhanced with **artificial intelligence** to assist in:  
- Patient symptom entry and self-assessment.  
- AI-driven disease prediction with probability scores.  
- Intelligent routing to the right doctor based on predicted conditions.  
- Automated scheduling to reduce overcrowding and streamline hospital workflow.  

This project is developed as an **academic end-year project** to demonstrate how AI can be integrated into healthcare systems to improve **efficiency, accuracy, and accessibility**.  

---

## 🚀 Key Features  
### Patient Module  
- Register / log in securely.  
- Enter **symptoms, severity level, and medication history**.  
- Receive **AI-powered preliminary diagnosis** with probability percentages.  
- Get follow-up **questions from AI** if symptoms are unclear.  
- Receive **feedback, prescriptions, or test requests** after doctor’s review.  

### AI Diagnosis Module  
- Processes patient symptoms.  
- Predicts probable diseases using ML/AI models.  
- Provides immediate health advice.  
- Forwards case details to relevant specialists.  

### Doctor Module  
- Dashboard to view **forwarded cases from AI**.  
- Confirm or reject AI predictions.  
- Prescribe treatment or request tests.  
- Approve/schedule appointments.  

### Scheduling Module  
- Intelligent appointment booking based on:  
  - Disease type.  
  - Doctor availability.  
  - Workload balancing (to avoid overcrowding).  
- Automatic patient notifications & reminders.  

### Admin Module  
- Manage doctors, patients, schedules, and hospital data.  
- Monitor disease trends and doctor utilization.  

---

## 🛠️ System Architecture  
- **Frontend:** Angular (patient & doctor dashboards).  
- **Backend:** Nestjs.  
- **AI Engine:** Python (scikit-learn / TensorFlow for disease prediction).  
- **Database:** PostgreSQL (patients, doctors, appointments, prescriptions).  
- **Authentication:** JWT / OAuth2 (secure logins).  
- **Hosting:** Render / Vercel / AWS / Azure / Local deployment.  

---

## ⚙️ Installation & Setup  
1. Clone the repository:  
   ```bash
   git clone https://github.com/your-username/healthflow-ai.git
   cd healthflow-ai
2. Install dependencies:
    ```bash
    npm install   # For frontend
    pip install -r requirements.txt   # For AI backend
3. Configure environment variables (.env file):
    DATABASE_URL=your_database_url
    SECRET_KEY=your_secret_key
    AI_MODEL_PATH=path_to_trained_model
4. Run backend server:
    ```bash
    python manage.py runserver
5. Run frontend:
    ```bash
    npm start

🎯 Usage Flow

Patient logs in and submits symptoms.

AI predicts possible diseases + probabilities.

Relevant doctor is automatically notified.

Doctor confirms diagnosis or requests tests.

Appointment is scheduled automatically.

Patient receives treatment plan or next steps.

🔮 Future Enhancements

Integration with Electronic Health Records (EHRs).

Real-time lab test result integration.

Telemedicine module for virtual doctor consultations.

Mobile app version (Android/iOS).

NLP-powered chatbot for patient interaction.

📚 Acknowledgments

Project Supervisor: [Your Lecturer’s Name]

Institution: Chuka University.

Inspired by global efforts to make AI in healthcare more accessible.

📝 License

This project is for academic purposes
