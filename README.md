# maroctax

Open-source Moroccan payroll ecosystem — core engine (TypeScript · Java · Dart), framework integrations, live demo, and REST API.

## Live demo

After enabling GitHub Pages on `main`, the demo is at:

**https://hamza-spc.github.io/maroctax/**

Local run:

```bash
cd typescript/maroctax && npm ci && npm run build
cd ../../angular/maroctax-angular && npm ci && npm run build
cd ../../demo/web && npm ci && npm start
```

## REST API

```bash
cd java/maroctax-core && mvn install -DskipTests
cd ../maroctax-spring-boot-starter && mvn install -DskipTests
cd ../maroctax-api && mvn spring-boot:run
```

- Health: `GET http://localhost:8080/api/v1/health`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

Example:

```bash
curl -s -X POST http://localhost:8080/api/v1/net-salary \
  -H 'Content-Type: application/json' \
  -d '{"gross": 10000, "dependents": 0, "year": 2025}'
```

## License

MIT — see [LICENSE](LICENSE).
