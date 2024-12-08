const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
// Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
// Jaeger Exporter
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

module.exports = (serviceName) => {
    // Configure Jaeger Exporter
    const exporter = new JaegerExporter({
        endpoint: 'http://localhost:14268/api/traces', // Default Jaeger endpoint
    });

    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    });

    // Use Jaeger Exporter instead of ConsoleSpanExporter
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    provider.register();

    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new MongoDBInstrumentation(),
        ],
        tracerProvider: provider,
    });

    return trace.getTracer(serviceName);
};