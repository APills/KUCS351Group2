module com.socialmedia {
    requires javafx.controls;
    requires javafx.fxml;


    opens com.socialmedia to javafx.fxml;
    exports com.socialmedia;
}