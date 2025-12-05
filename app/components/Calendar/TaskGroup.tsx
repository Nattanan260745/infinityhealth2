import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '@/app/hook/useCalendar';

interface TaskGroupProps {
    title: string;
    tasks: Task[];
    onToggleTask: (taskId: number) => void;
}

export const TaskGroup: React.FC<TaskGroupProps> = ({ title, tasks, onToggleTask }) => {
    if (tasks.length === 0) return null;

    return (
        <View style={{ marginBottom: 24 }}>
            <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#374151',
                marginBottom: 12,
                marginLeft: 4,
            }}>
                {title}
            </Text>
            {tasks.map((task) => (
                <TouchableOpacity
                    key={task.id}
                    onPress={() => onToggleTask(task.id)}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 16,
                        paddingVertical: 18,
                        borderRadius: 16,
                        marginBottom: 12,
                        backgroundColor: task.completed ? '#ECFDF5' : '#F9FAFB',
                    }}
                >
                    <View
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            borderWidth: task.completed ? 0 : 2,
                            borderColor: '#D1D5DB',
                            backgroundColor: task.completed ? '#10B981' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 14,
                        }}
                    >
                        {task.completed && (
                            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                        )}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '500',
                                color: task.completed ? '#059669' : '#374151',
                            }}
                        >
                            {task.title}
                        </Text>
                        {task.time && (
                            <Text
                                style={{
                                    fontSize: 13,
                                    color: task.completed ? '#34D399' : '#9CA3AF',
                                    marginTop: 4,
                                }}
                            >
                                {task.time}
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
};

