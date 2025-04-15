import React, { useState, useEffect, useRef } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface CheckedTasks {
  [key: number]: boolean;
}

const baseSteps: Step[] = [
  {
    target: ".task-input",
    content: "Start by typing your task here.",
    disableBeacon: true,
  },
  {
    target: ".add-button",
    content: "Click this button to create your task.",
    disableBeacon: true,
  },
  {
    target: ".checkbox",
    content: "Check this box to mark your task as completed.",
    disableBeacon: true,
  },
  {
    target: ".edit-button",
    content: "Click to edit your task.",
    disableBeacon: true,
  },
  {
    target: ".task-edit-input",
    content: "Now you can edit your task here.",
    disableBeacon: true,
  },
  {
    target: ".save-button",
    content: "Save your edited task.",
    disableBeacon: true,
  },
  {
    target: ".delete-button",
    content: "Click to delete your task.",
    disableBeacon: true,
  },
];

const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newEdit, setNewEdit] = useState<string>("");
  const [checkedTasks, setCheckedTasks] = useState<CheckedTasks>({});
  const [joyrideRun, setJoyrideRun] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [steps] = useState<Step[]>(baseSteps);
  const [wasEditing, setWasEditing] = useState<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setJoyrideRun(true);
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index, action } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setJoyrideRun(false);
      return;
    }

    if (type === "step:after") {
      if (index === 3 && wasEditing) {
        setStepIndex(4);
      } else if (!(index === 5 && wasEditing)) {
        setStepIndex(index + 1);
      }
    }

    if (type === "step:after" && action === "prev") {
      if (index === 6 && !wasEditing) {
        setStepIndex(3);
      } else {
        setStepIndex(index - 1);
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTask(event.target.value);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (stepIndex === 0) {
        setStepIndex(1);
      }
    }, 2000);
  };

  const addTask = () => {
    if (newTask.trim() !== "") {
      setTasks([...tasks, newTask.trim()]);
      setNewTask("");

      if (stepIndex === 1) {
        setStepIndex(2);
      }
    }
  };

  const deleteTask = (index: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const saveTask = () => {
    if (newEdit.trim() !== "" && editIndex !== null) {
      const updatedTasks = [...tasks];
      updatedTasks[editIndex] = newEdit.trim();
      setTasks(updatedTasks);
      setEditIndex(null);
      setNewEdit("");
      setWasEditing(false);

      if (stepIndex === 5) {
        setStepIndex(6);
      }
    }
  };

  const editTask = (index: number) => {
    setEditIndex(index);
    setNewEdit(tasks[index]);
    setWasEditing(true);

    if (stepIndex === 3) {
      setStepIndex(4);
    }
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewEdit(event.target.value);

    if (editTypingTimeoutRef.current)
      clearTimeout(editTypingTimeoutRef.current);

    editTypingTimeoutRef.current = setTimeout(() => {
      if (stepIndex === 4) {
        setStepIndex(5);
      }
    }, 2000);
  };

  const toggleCheckbox = (index: number) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (editTypingTimeoutRef.current)
        clearTimeout(editTypingTimeoutRef.current);
    };
  }, []);

  return (
    <div className='to-do-list'>
      <h1>To-Do List</h1>
      <div>
        <input
          type='text'
          placeholder='Enter a task...'
          value={newTask}
          onChange={handleInputChange}
          className='task-input'
        />
        &nbsp;&nbsp;
        <button className='add-button' onClick={addTask}>
          Add
        </button>
      </div>

      <ol className='task-list'>
        {tasks.map((task, index) => (
          <li key={index}>
            <input
              className={checkbox checkbox-${index}}
              type='checkbox'
              checked={!!checkedTasks[index]}
              onChange={() => toggleCheckbox(index)}
            />
            {editIndex === index ? (
              <input
                type='text'
                value={newEdit}
                onChange={handleEditChange}
                className='task-edit-input'
              />
            ) : (
              <span
                className={text ${checkedTasks[index] ? "strikethrough" : ""}}
              >
                {task}
              </span>
            )}

            {editIndex === index ? (
              <button className='save-button' onClick={saveTask}>
                Save
              </button>
            ) : (
              <>
                <button
                  className='delete-button'
                  onClick={() => deleteTask(index)}
                >
                  Delete
                </button>
                <button className='edit-button' onClick={() => editTask(index)}>
                  Edit
                </button>
              </>
            )}
          </li>
        ))}
      </ol>

      <Joyride
        steps={steps}
        run={joyrideRun}
        stepIndex={stepIndex}
        continuous
        scrollToFirstStep
        showSkipButton
        showProgress
        disableOverlayClose
        spotlightClicks={true}
        callback={handleJoyrideCallback}
      />
    </div>
  );
};

export default TodoList;
