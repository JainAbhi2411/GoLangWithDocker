import { useState, useEffect } from "react";

const apiUrl = process.env.REACT_APP_API_URL;

export default function KubernetesDashboard() {
  const [pods, setPods] = useState([]);
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    fetchPods();
    fetchDeployments();
  }, []);

  const fetchPods = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/k8s/pods`);
      const data = await response.json();
      if (response.ok) {
        setPods(data);
      } else {
        console.error("Error fetching pods:", data.error);
      }
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  const fetchDeployments = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/k8s/deployments`);
      const data = await response.json();
      if (response.ok) {
        setDeployments(data);
      } else {
        console.error("Error fetching deployments:", data.error);
      }
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Kubernetes Dashboard</h1>
      
      <section>
        <h2 className="text-xl font-semibold">Pods</h2>
        <ul>
          {pods.map((pod) => (
            <li key={pod.name}>{pod.name} - {pod.status}</li>
          ))}
        </ul>
      </section>

      <section className="mt-4">
        <h2 className="text-xl font-semibold">Deployments</h2>
        <ul>
          {deployments.map((deployment) => (
            <li key={deployment.name}>{deployment.name} - {deployment.replicas} replicas</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
