var conn = jdbc("org.sqlite.JDBC","jdbc:sqlite:db/live")
conn.createStatement().executeUpdate("DROP TABLE posts")
conn.createStatement().executeUpdate("DROP TABLE tags")
