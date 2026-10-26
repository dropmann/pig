
pigClass <- if (requireNamespace('jmvcore', quietly=TRUE)) R6::R6Class(
    "pigClass",
    inherit = pigBase,
    private = list(
        .init = function() {
            # served from inst/js, and loaded by the client before the content
            # below is inserted
            # setScripts() rather than $scripts <-, because the nested
            # replacement would assign back through the read-only $pig binding
            self$results$pig$setScripts('js/pig.js')
        },
        .run = function() {
            # more than one pig can be in the results, so each svg gets its
            # own id for its script to find it by
            id <- paste0('pig-', paste(sample(c(letters, 0:9), 12, replace=TRUE), collapse=''))
            self$results$pig$setContent(paste0(
                private$.drawing(id),
                '<script>pig.attach("', id, '");</script>'))
        },
        .drawing = function(id) {
            # the shapes with a data-blush colour are those pig.js reddens
            # when the pig's bacon is touched
            sprintf('<svg id="%s" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"
                 width="400" height="300">
                <g stroke="#b3476b" stroke-width="3" stroke-linejoin="round">
                    <!-- legs -->
                    <rect x="105" y="195" width="28" height="60" rx="8" fill="#f4a6bd" />
                    <rect x="150" y="200" width="28" height="58" rx="8" fill="#f4a6bd" />
                    <rect x="225" y="200" width="28" height="58" rx="8" fill="#f4a6bd" />
                    <rect x="268" y="195" width="28" height="60" rx="8" fill="#f4a6bd" />
                    <!-- tail -->
                    <path d="M 82 150 q -22 -10 -16 -28 q 6 -14 18 -4 q 10 10 -4 18 q -14 6 -20 -6"
                          fill="none" stroke-linecap="round" />
                    <!-- body -->
                    <!-- interactive, so a click on it is the pig\'s rather
                         than a selection of the whole svg. see pig.js -->
                    <ellipse class="pig-body jmv-results-svg-interactive"
                             cx="190" cy="160" rx="112" ry="72" fill="#f8bccd"
                             data-blush="#f28aa6"
                             style="cursor: pointer; transition: fill 0.4s" />
                    <!-- ears -->
                    <path d="M 262 72 l -6 -34 l 30 22 z" fill="#f4a6bd" />
                    <path d="M 312 72 l 8 -34 l 20 30 z" fill="#f4a6bd" />
                    <!-- head -->
                    <circle cx="298" cy="118" r="50" fill="#f8bccd"
                            data-blush="#f28aa6" style="transition: fill 0.4s" />
                    <!-- snout -->
                    <ellipse cx="338" cy="130" rx="24" ry="18" fill="#f4a6bd"
                             data-blush="#ec7898" style="transition: fill 0.4s" />
                </g>
                <!-- nostrils -->
                <ellipse cx="331" cy="130" rx="4" ry="6" fill="#b3476b" />
                <ellipse cx="345" cy="130" rx="4" ry="6" fill="#b3476b" />
                <!-- eyes -->
                <circle cx="286" cy="102" r="6" fill="#222" />
                <circle cx="316" cy="100" r="6" fill="#222" />
                <circle cx="288" cy="100" r="2" fill="#fff" />
                <circle cx="318" cy="98" r="2" fill="#fff" />
                <!-- cheek -->
                <ellipse cx="282" cy="130" rx="9" ry="5" fill="#ee8aa8" opacity="0.7"
                         data-blush="#d92a57" style="transition: fill 0.4s" />
                <!-- ground -->
                <line x1="60" y1="258" x2="360" y2="258" stroke="#ccc" stroke-width="2" />
                <!-- drawn by pig.js, from the size the svg is shown at -->
                <g class="pig-sized"></g>
            </svg>', id)
        })
)
