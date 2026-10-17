# RouteWise — Intelligent Logistics Lab

A responsive, static website for an academic project on intelligent logistics and routing. It is designed to run on GitHub Pages without a backend.

## Interactive features
- Choose a start location and destination in a synthetic 16-node road network.
- Run Dijkstra, BFS, or A* pathfinding in the browser.
- Click road segments to close or reopen roads and recalculate routes.
- Compare the selected path, total route weight, estimated time proxy, explored nodes, and active closures.
- Reset the network and experiment again.
- Research sections cover routing concepts, constraints, algorithms, and a simplified system architecture.

## Important limitations
- The road graph and edge weights are synthetic, illustrative demo data. They are not real geographic distances or live traffic.
- The time value is a simple estimate based on synthetic route weights, not a traffic prediction.
- This is a single-route pathfinding demonstration, not a complete multi-vehicle fleet optimization solver.
- The website does not run quantum algorithms; quantum computing is not presented as a current replacement for classical routing algorithms.

## Run locally
Open `index.html` in a modern browser. No build step or server is required.

## Publish on GitHub Pages
1. Create a new repository on GitHub.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then save.
6. Wait for GitHub Pages to publish the site; the URL will appear in the Pages settings.

## Project structure
- `index.html` — page content and sections
- `style.css` — responsive visual design and network styles
- `script.js` — graph model, route algorithms, interactive road closures, and metrics
