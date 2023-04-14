module com.example.demo {
    requires javafx.controls;
    requires javafx.fxml;


    opens com.example.CS351 to javafx.fxml;
    exports com.example.CS351;
}