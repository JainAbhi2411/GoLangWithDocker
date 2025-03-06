package main

import (
        "encoding/json"
        "log"
        "net/http"
        "os/exec"
        "strings"
        "fmt"
        "io"
)
type Volume struct {
    HostPath      string json:"host_path"
    ContainerPath string json:"container_path"
}

type EnvVar struct {
    Key   string json:"key"
    Value string json:"value"
}
type Image struct {
        Repository string json:"Repository"
        Tag        string json:"Tag"
        ImageID    string json:"ImageID"
        Size       string json:"Size"
}
type Container struct {
        ID     string json:"ID"
        Names  string json:"Names"
        State  string json:"State"
        Image  string json:"Image"
        Status string json:"Status"
}

// Response struct for API responses
type Response struct {
        Status  string json:"status,omitempty"
        Message string json:"message,omitempty"
        Error   string json:"error,omitempty"
        Logs    string   json:"logs,omitempty"
        Inspect string   json:"inspect,omitempty"
        BindMounts string   json:"bind_mounts,omitempty"
        Files      string   json:"files,omitempty"
        Stats      string   json:"stats,omitempty"
        Output     string   json:"output,omitempty"
}
func enableCORS(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
                w.Header().Set("Access-Control-Allow-Origin", "*")
                w.Header().Set("Access-Control-Allow-Methods", "GET, POST,DELETE, OPTIONS")
                w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

                // Handle OPTIONS requests (preflight)
                if r.Method == "OPTIONS" {
                        w.WriteHeader(http.StatusOK)
                        return
                }

                next.ServeHTTP(w, r)
        })
}
func dockerHandler(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")

        // Parse query parameters
        action := r.URL.Query().Get("action")
        fmt.Println(action)
        containerName := r.URL.Query().Get("container_name")

        if action == "" {
                http.Error(w, {"error": "Action is required"}, http.StatusBadRequest)
                return
}

        // Map actions to Docker commands
        var cmd *exec.Cmd
        switch action {
        case "start_container":
                if containerName == "" {
                        http.Error(w, {"error": "Container name is required for start"}, http.StatusBadRequest)
                        return
                }
                cmd = exec.Command("docker", "start", containerName)

        case "stop_container":
                if containerName == "" {
                        http.Error(w, {"error": "Container name is required for stop"}, http.StatusBadRequest)
                        return
                }
                cmd = exec.Command("docker", "stop", containerName)
case "inspect":
                if containerName == "" {
                        http.Error(w, {"error": "Container name is required for inspect"}, http.StatusBadRequest)
                        return
                }
                cmd = exec.Command("docker", "inspect", containerName)

        default:
                http.Error(w, {"error": "Invalid action"}, http.StatusBadRequest)
                return
        }

        // Execute command
        output, err := cmd.CombinedOutput()
        if err != nil {
                resp := Response{Error: "Failed to execute command: " + err.Error()}
                json.NewEncoder(w).Encode(resp)
                return
        }

        // Send JSON response
        resp := Response{Status: "success", Message: strings.TrimSpace(string(output))}
        json.NewEncoder(w).Encode(resp)
}func executeCommand(cmd *exec.Cmd) (string, error) {
    output, err := cmd.CombinedOutput()
    if err != nil {
        return "", fmt.Errorf("%s: %s", err.Error(), string(output))
    }
    return string(output), nil
}
//logs handler
func logsHandler(w http.ResponseWriter, r *http.Request) {
        containerName := r.URL.Query().Get("container_name")
        if containerName == "" {
                http.Error(w, {"error": "Container name is required"}, http.StatusBadRequest)
                return
        }

        cmd := exec.Command("docker", "logs", containerName)
        output, err := executeCommand(cmd)
        if err != nil {
                json.NewEncoder(w).Encode(Response{Error: "Failed to fetch logs: " + err.Error()})
                return
        }

        json.NewEncoder(w).Encode(Response{Logs: output})
}func inspectHandler(w http.ResponseWriter, r *http.Request) {
        containerName := r.URL.Query().Get("container_name")
        if containerName == "" {
                http.Error(w, {"error": "Container name is required"}, http.StatusBadRequest)
                return
        }

        cmd := exec.Command("docker", "inspect", containerName)
        output, err := executeCommand(cmd)
        if err != nil {
                json.NewEncoder(w).Encode(Response{Error: "Failed to inspect container: " + err.Error()})
                return
        }

        json.NewEncoder(w).Encode(Response{Inspect: output})
}

// Bind Mounts Handler (Placeholder: Modify based on your implementation)
func bindMountsHandler(w http.ResponseWriter, r *http.Request) {
        json.NewEncoder(w).Encode(Response{BindMounts: "Bind mount data here"}) // Modify as needed
}// Execute Command in Container
func execHandler(w http.ResponseWriter, r *http.Request) {
        containerName := r.URL.Query().Get("container_name")
        command := r.URL.Query().Get("command")

        if containerName == "" || command == "" {
                http.Error(w, {"error": "Container name and command are required"}, http.StatusBadRequest)
                return
        }

        cmd := exec.Command("docker", "exec", containerName, "sh", "-c", command)
        output, err := executeCommand(cmd)
        if err != nil {
                json.NewEncoder(w).Encode(Response{Error: "Failed to execute command: " + err.Error()})
                return
        }

        json.NewEncoder(w).Encode(Response{Output: output})
}func filesHandler(w http.ResponseWriter, r *http.Request) {
        containerName := r.URL.Query().Get("container_name")
        directory := r.URL.Query().Get("directory")

        if containerName == "" || directory == "" {
                http.Error(w, {"error": "Container name and directory are required"}, http.StatusBadRequest)
                return
        }

        cmd := exec.Command("docker", "exec", containerName, "ls", "-1", directory)
        output, err := executeCommand(cmd)
        if err != nil {
                json.NewEncoder(w).Encode(Response{Error: "Failed to list files: " + err.Error()})
                return
        }

        json.NewEncoder(w).Encode(Response{Files: output})
}func statsHandler(w http.ResponseWriter, r *http.Request) {
        containerName := r.URL.Query().Get("container_name")
        if containerName == "" {
                http.Error(w, {"error": "Container name is required"}, http.StatusBadRequest)
                return
        }

        cmd := exec.Command("docker", "stats", "--no-stream", "--format", {{json .}}, containerName)
        output, err := executeCommand(cmd)
        if err != nil {
                json.NewEncoder(w).Encode(Response{Error: "Failed to get container stats: " + err.Error()})
                return
        }

        json.NewEncoder(w).Encode(Response{Stats: output})
}func listContainers(w http.ResponseWriter, r *http.Request) {

        cmd := exec.Command("docker", "ps", "-a", "--format", {{json .}})
        output, err := cmd.Output()
        if err != nil {
                http.Error(w, {"error": "Failed to get container list"}, http.StatusInternalServerError)
                return
        }

        var containers []Container
        lines := strings.Split(strings.TrimSpace(string(output)), "\n")
        for _, line := range lines {
                var c Container
                json.Unmarshal([]byte(line), &c)
                containers = append(containers, c)
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(containers)
}func runDockerCommand(action, containerName string) (string, error) {
        fmt.Println(action)
        fmt.Println(containerName)
        cmd := exec.Command("docker", action, containerName)
        output, err := cmd.CombinedOutput()
        return string(output), err
}
// Handle container actions
func containerHandler(w http.ResponseWriter, r *http.Request) {
        var req map[string]string
        json.NewDecoder(r.Body).Decode(&req)

        containerName, hasName := req["name"]
        //fmt.Println(containerName)
        if !hasName {
                http.Error(w, {"error": "Missing container name"}, http.StatusBadRequest)
                return
        }

        action := ""
        switch r.URL.Path {
        case "/api/start-container":
                action = "start"
        case "/api/stop-container":
                action = "stop"
        case "/api/delete-container":
                action = "rm"
        default:
                http.Error(w, {"error": "Invalid endpoint"}, http.StatusNotFound)
                return
        }

        // Execute Docker command
        result,err := runDockerCommand(action, containerName)if err != nil {
                http.Error(w, {"error": "Command failed: +err.Error()+"}, http.StatusInternalServerError)
                return
        }
        // Send JSON response
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(result)
}func listImages(w http.ResponseWriter, r *http.Request) {
        cmd := exec.Command("docker", "images", "--format", "{{json .}}")
        output, err := cmd.Output()
        if err != nil {
                http.Error(w, {"error": "Failed to list images"}, http.StatusInternalServerError)
                return
        }

        lines := strings.Split(strings.TrimSpace(string(output)), "\n")
        var images []Image

        for _, line := range lines {
                var img Image
                err := json.Unmarshal([]byte(line), &img)
                if err == nil {
                        images = append(images, img)
                }
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]interface{}{"status": "success", "images": images})
}func deleteImage(w http.ResponseWriter, r *http.Request) {
        imageName := r.URL.Query().Get("image_name")
        if imageName == "" {
                http.Error(w, {"error": "Image name required"}, http.StatusBadRequest)
                return
        }

        cmd := exec.Command("docker", "rmi", imageName)
        err := cmd.Run()
        if err != nil {
                http.Error(w, {"error": "Failed to delete image"}, http.StatusInternalServerError)
                return
        }

        json.NewEncoder(w).Encode(Response{Status: "success", Message: "Image deleted"})
}// LaunchContainerRequest represents the request body for launching a container
type LaunchContainerRequest struct {
        Image        string            json:"image"
        ContainerName string            json:"container_name"
        HostPort     string            json:"host_port"
        Volumes      []map[string]string json:"volumes"
        EnvVars      []map[string]string json:"env_vars"
}
func launchContainer(w http.ResponseWriter, r *http.Request) {

        body, _ := io.ReadAll(r.Body)
        fmt.Println("Received JSON:", string(body))

        var req LaunchContainerRequest
        er1r := json.Unmarshal(body, &req)
        if er1r != nil {
            http.Error(w, {"error": "Invalid request body"}, http.StatusBadRequest)
            return
    }
        fmt.Printf("Parsed JSON: %+v\n", req)

        args := []string{"run", "-dit"}
        if req.ContainerName != "" {
                args = append(args, "--name", req.ContainerName)
        }
        if req.HostPort != "" {
                args = append(args, "-p", req.HostPort+":80")
        }
        for _, vol := range req.Volumes {
                args = append(args, "-v", fmt.Sprintf("%s:%s", vol["host_path"], vol["container_path"]))
        }
        for _, env := range req.EnvVars {
                args = append(args, "-e", fmt.Sprintf("%s=%s", env["key"], env["value"]))
        }
        args = append(args, req.Image)cmd := exec.Command("docker", args...)
        err := cmd.Run()
        if err != nil {
                http.Error(w, {"error": "Failed to run container"}, http.StatusInternalServerError)
                return
        }

        json.NewEncoder(w).Encode(Response{Status: "success", Message: "Container launched"})
}

// DownloadImageRequest represents the request body for downloading a Docker image
type DownloadImageRequest struct {
        ImageName string json:"image_name"
        TagName   string json:"tag_name"
}// DownloadImage handles pulling a Docker image
func downloadImage(w http.ResponseWriter, r *http.Request) {
        var req DownloadImageRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
                http.Error(w, {"error": "Invalid request body"}, http.StatusBadRequest)
                return
        }

        fullImageName := req.ImageName
        if req.TagName != "" {
                fullImageName += ":" + req.TagName
        }

        cmd := exec.Command("docker", "pull", fullImageName)
        err := cmd.Run()
        if err != nil {
                http.Error(w, {"error": "Failed to pull image"}, http.StatusInternalServerError)
                return
        }

        json.NewEncoder(w).Encode(Response{Status: "success", Message: "Image downloaded"})
}func main() {
        mux := http.NewServeMux()

        mux.HandleFunc("/api/containers",listContainers)       // GET: List containers
        mux.HandleFunc("/api/start-container", containerHandler)
        mux.HandleFunc("/api/stop-container", containerHandler)
        mux.HandleFunc("/api/delete-container", containerHandler)// POST: Start/Stop/Delete
        mux.HandleFunc("/api/docker", dockerHandler)
        mux.HandleFunc("/api/docker/logs", logsHandler)
        mux.HandleFunc("/api/docker/inspect", inspectHandler)
        mux.HandleFunc("/api/docker/bindmounts", bindMountsHandler)
        mux.HandleFunc("/api/docker/exec", execHandler)
        mux.HandleFunc("/api/docker/files", filesHandler)
        mux.HandleFunc("/api/docker/stats", statsHandler)
        mux.HandleFunc("/api/images", listImages)     // GET: List images
        mux.HandleFunc("/api/delete-image", deleteImage) // DELETE: Delete an image
        mux.HandleFunc("/api/download-image", downloadImage) // POST: Pull a new image
        mux.HandleFunc("/api/containerimage", launchContainer)
        handler := enableCORS(mux)
        port := "8081"
        log.Println("Server running on port", port)
        log.Fatal(http.ListenAndServe(":"+port, handler))
}