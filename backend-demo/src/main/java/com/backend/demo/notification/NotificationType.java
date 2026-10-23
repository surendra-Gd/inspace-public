package com.backend.demo.notification;

import lombok.Getter;

@Getter
public enum NotificationType {
    POST_ADDED("New Post Alert 🚀", "Whoa! %s just dropped a fresh post in %s. Go check it out!"),
    JOIN_MEMBER("New Member Alert 🎉", "Guess what? %s just joined %s. Go say hey!"),
    TEXT_ADDED("New Text Alert ✍️", "Yo! %s just added some new text in %s. Don't miss it!"),
    INCOMING_REQUEST("New Request Alert 📥", "Yo! %s sent you a request. Wanna check it out?"),
    ACCEPT_REQUEST("Request Accepted ✅", "Sweet! %s accepted your request. Time to connect!"),
    SPACE_REQUEST("Space Request Alert 🌌", "Whoa! Someone's requesting to join %s. What's the move?"),
    ACCEPT_SPACE_REQUEST("Space Request Accepted 🎊", "Nice! Your request to join %s got accepted. Welcome to the fam! 🎉");

    private final String title;
    private final String template;

    NotificationType(String title, String template) {
        this.title = title;
        this.template = template;
    }

    // Method to format the description with dynamic data
    public String format(Object... args) {
        return String.format(template, args);
    }

    public String formatPostContent(int streak, String username, String spaceId, String type) {
        if (streak > 0) {
            return String.format(
                    "Yoh! %s is on fire with a %d %s 🔥 by dropping a new %s in %s. Keep slaying!",
                    username, streak, streak > 1 ? "streaks" : "streak", type, spaceId
            );
        } else {
            return String.format(template, username, spaceId);
        }
    }
}
