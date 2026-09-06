    # APWCFS concept

    ```text
                        APWCFS
                           |
           +-------------------+-------------------+
           |                   |                   |
           v                   v                   v
       OBSERVE              FORECAST             EXPLAIN
           |                   |                   |
       Stations, weather,   Coupled model,       Drivers, provenance,
       satellite signals    post-processing       uncertainty, actions
           |                   |                   |
           +-------------------+-------------------+
                           |
                           v
                    Delhi NCR decisions
    ```

    ## The product idea

    APWCFS turns a complex atmospheric state into a chain a person can inspect:

    ```text
    What is happening? -> What is expected? -> Why? -> What should I do?
    ```

    The map is the primary output. Weather, fire activity, timelines, and explanations exist to help users interpret the map rather than compete with it.

    ## The scientific idea

    ```text
    Emissions + weather state
              |
              v
    Transport, mixing, chemistry, deposition
              |
              v
    Surface pollutant concentrations
              |
              v
    AQI and health-relevant communication
    ```

    The phrase "weather coupled" means the forecast accounts for the way wind, humidity, temperature, stability, boundary-layer height, and precipitation alter pollution behavior. It does not mean the frontend itself is a WRF-Chem solver.

    ## Three states of knowledge

    Every displayed layer should make its epistemic status clear:

    - **Observed**: measured or reported by a monitoring provider.
    - **Estimated**: derived from a proxy or fallback calculation.
    - **Modelled**: produced by a forecast or transport model.

    This small distinction is a core product feature. It prevents a smooth heat map from looking more certain than the underlying data.