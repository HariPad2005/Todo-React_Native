import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import dayjs from "dayjs";

interface Task {
  id: string;
  title: string;
  deadline: string;
  countdown: string;
  completed: boolean;
}

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    Notifications.requestPermissionsAsync();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  const updateCountdowns = () => {
    const updatedTasks = tasks.map((task) => {
      const deadline = dayjs(task.deadline);
      const now = dayjs();
      const diff = deadline.diff(now, "second");
      const countdown =
        diff <= 0 ? "Expired" : `${Math.floor(diff / 60)} min ${diff % 60} sec`;
      return { ...task, countdown };
    });
    setTasks(updatedTasks);
  };

  const scheduleNotification = async (task: Task) => {
    const taskDeadline = dayjs(task.deadline);
    const reminderTime = taskDeadline.subtract(15, "minute").toDate();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Task Reminder",
        body: `Reminder: Your task "${task.title}" is due in 15 minutes.`,
      },
      trigger: { date: reminderTime },
    });
  };

  const addTask = () => {
    if (!newTask.trim()) {
      Alert.alert("Notification", "Please enter a task title!");
      return;
    }
    if (!selectedDate) {
      Alert.alert("Notification", "Please select a deadline!");
      return;
    }

    const newTaskItem: Task = {
      id: Date.now().toString(),
      title: newTask,
      deadline: selectedDate,
      countdown: "",
      completed: false,
    };

    setTasks([...tasks, newTaskItem]);
    setNewTask("");
    setSelectedDate("");

    scheduleNotification(newTaskItem);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const toggleComplete = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.taskContainer}>
      <TouchableOpacity onPress={() => toggleComplete(item.id)}>
        <FontAwesome
          name={item.completed ? "check-circle" : "circle-o"}
          size={24}
          color={item.completed ? "#4CAF50" : "#ccc"}
        />
      </TouchableOpacity>
      <View style={styles.taskInfo}>
        <Text style={[styles.taskText, item.completed && styles.completedText]}>
          {item.title}
        </Text>
        <Text style={styles.taskDate}>{item.deadline}</Text>
        <Text style={styles.countdown}>{item.countdown}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <MaterialIcons name="delete" size={24} color="#FF6347" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enhanced To-Do List</Text>
      <Calendar
        onDayPress={(day: { dateString: React.SetStateAction<string> }) =>
          setSelectedDate(day.dateString)
        }
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: "#4CAF50" },
        }}
        theme={{
          todayTextColor: "#FF6347",
          selectedDayBackgroundColor: "#4CAF50",
          arrowColor: "#4CAF50",
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter a new task"
        value={newTask}
        onChangeText={setNewTask}
      />
      <TouchableOpacity style={styles.addButton} onPress={addTask}>
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        style={styles.taskList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#4CAF50",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  taskList: {
    marginTop: 10,
    width: "100%",
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
  },
  taskInfo: {
    flex: 1,
    alignItems: "center",
  },
  taskText: {
    fontSize: 16,
  },
  taskDate: {
    fontSize: 14,
    color: "#777",
  },
  countdown: {
    fontSize: 14,
    color: "#FF6347",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
});
