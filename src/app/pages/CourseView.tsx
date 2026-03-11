import { useParams, useNavigate } from "react-router";
import { DailyTaskScreen } from "../components/DailyTaskScreen";

export default function CourseView() {
  const { day } = useParams();
  const navigate = useNavigate();
  
  const dayNumber = parseInt(day || "1", 10);
  
  return <DailyTaskScreen day={dayNumber} onBack={() => navigate(-1)} />;
}
